import type { Handler, APIGatewayEvent, ProxyResult } from 'aws-lambda'

import {
  formatWorkout,
  getPrimaryWorkout,
  isCrossFitProgram,
  listClasses,
  listPrograms,
  listWorkoutComponents,
  login,
  ReservationStatusId,
  signinClass,
} from './wodify'

export const getWorkout: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')

  if (!date || !email || !password) {
    console.error('Date, email and password are required.', { date, email })
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    const session = await login(email, password)
    const workout = await listWorkoutComponents(session, date)

    return {
      statusCode: 200,
      body: formatWorkout(getPrimaryWorkout(workout)) || 'Oh no! There is no workout posted.',
    }
  } catch (error: any) {
    console.error(error.message, { email, date })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}

export const signinCrossfit: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')

  if (!date || !email || !password) {
    console.error('Date, email and password are required.', { date, email })
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    const session = await login(email, password)
    const [classes, programs] = await Promise.all([listClasses(session, date), listPrograms(session)])

    const crossfitProgramIds = programs.filter(isCrossFitProgram).map((p) => p.ProgramId)
    const crossfitClasses = classes.filter((c) => crossfitProgramIds.includes(c.ProgramId))
    const alreadySignedIn = crossfitClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.SignedIn)
    const alreadyReserved = crossfitClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.Reserved)
    const nextAvailable = crossfitClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.None && c.IsAvailable) // prettier-ignore
    const signInto = alreadyReserved || nextAvailable

    const message = await (async () => {
      if (alreadySignedIn) {
        return `You are already signed in to ${alreadySignedIn.Name}`
      } else if (signInto) {
        const status = await signinClass(session, signInto.Id)
        if (status.NewStatusId === ReservationStatusId.SignedIn) {
          return `You are now signed in to ${signInto.Name}`
        }
        return `Sorry, I was unable to sign you in to ${signInto.Name}`
      } else if (crossfitClasses.length > 0) {
        return 'Sorry, there are no more classes for today.'
      } else {
        return 'Sorry, there are no classes on today.'
      }
    })()

    console.log(message, { email, date })

    return {
      statusCode: 200,
      body: message,
    }
  } catch (error: any) {
    console.error(error.message, { email, date })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}
