import { login, listWorkoutComponents, listClasses, signinClass } from './wodify/api.js'
import { formatWorkout, getPrimaryWorkout } from './wodify/format.js'
import { ReservationStatusId } from './wodify/types.js'

export async function getWorkout(username: string, password: string, date: string): Promise<string> {
  const session = await login(username, password)
  const workout = await listWorkoutComponents(session, date)
  return formatWorkout(getPrimaryWorkout(workout)) || 'Oh no! There is no workout posted.'
}

export async function signin(
  username: string,
  password: string,
  date: string,
  className: string = ''
): Promise<string> {
  const session = await login(username, password)
  const classes = await listClasses(session, date)
  const filteredClasses = classes.filter((c) => c.Name.toLowerCase().includes(className.toLowerCase()))
  const alreadySignedIn = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.SignedIn)
  const alreadyReserved = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.Reserved)
  const nextAvailable = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.None && c.IsAvailable) // prettier-ignore
  const signInto = alreadyReserved || nextAvailable

  if (alreadySignedIn) {
    return `You are already signed in to ${alreadySignedIn.Name}`
  } else if (signInto) {
    const status = await signinClass(session, signInto.Id)
    if (status.NewStatusId === ReservationStatusId.SignedIn) {
      return `You are now signed in to ${signInto.Name}`
    }
    return `Sorry, I was unable to sign you in to ${signInto.Name}`
  } else if (filteredClasses.length > 0) {
    return 'Sorry, there are no more classes for today.'
  } else {
    return 'Sorry, there are no classes on today.'
  }
}
