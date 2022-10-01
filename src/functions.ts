import { login, listWorkoutComponents, listClasses, listPrograms, signinClass } from './wodify/api.js'
import { formatWorkout, getPrimaryWorkout } from './wodify/format.js'
import { ReservationStatusId, Program } from './wodify/types.js'

export async function getWorkout(username: string, password: string, date: string): Promise<string> {
  const session = await login(username, password)
  const workout = await listWorkoutComponents(session, date)
  return formatWorkout(getPrimaryWorkout(workout)) || 'Oh no! There is no workout posted.'
}

export async function signinCrossfit(username: string, password: string, date: string): Promise<string> {
  const session = await login(username, password)
  const [classes, programs] = await Promise.all([listClasses(session, date), listPrograms(session)])

  const crossfitProgramIds = programs.filter(isCrossFitProgram).map((p) => p.ProgramId)
  const crossfitClasses = classes.filter((c) => crossfitProgramIds.includes(c.ProgramId))
  const alreadySignedIn = crossfitClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.SignedIn)
  const alreadyReserved = crossfitClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.Reserved)
  const nextAvailable = crossfitClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.None && c.IsAvailable) // prettier-ignore
  const signInto = alreadyReserved || nextAvailable

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
}

export function isCrossFitProgram(program: Program) {
  return program.Name.toLowerCase().includes('crossfit')
}
