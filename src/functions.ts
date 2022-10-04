import { login, listWorkoutComponents, listClasses, signinClass } from './wodify/api.js'
import { filterWorkout, formatWorkout } from './wodify/format.js'
import { Class, ReservationStatusId } from './wodify/types.js'

interface GetWorkoutParams {
  username: string
  password: string
  date: string
  includeSections: string[]
  excludeSections: string[]
}

export async function getWorkout({
  username,
  password,
  date,
  includeSections,
  excludeSections,
}: GetWorkoutParams): Promise<string> {
  const session = await loginWrapper(username, password)
  const workout = await listWorkoutComponents(session, date)
  const filteredWorkout = filterWorkout(workout, includeSections, excludeSections)
  return formatWorkout(filteredWorkout) || 'Oh no! There is no workout posted.'
}

interface SigninParams {
  username: string
  password: string
  date: string
  includeClasses: string[]
  excludeClasses: string[]
}

export async function signin({
  username,
  password,
  date,
  includeClasses,
  excludeClasses,
}: SigninParams): Promise<string> {
  const session = await loginWrapper(username, password)
  const classes = await listClasses(session, date)
  const filteredClasses = classes.filter(createClassesFilter(includeClasses, excludeClasses))
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

// this filter uses partial matching rules and is case-insensitive
// eg. if you pass in "barbell" it will match "Barbell Club"
function createClassesFilter(includeClasses: string[], excludeClasses: string[]): (c: Class) => boolean {
  includeClasses = includeClasses.map((s) => s.toLowerCase())
  excludeClasses = excludeClasses.map((s) => s.toLowerCase())
  return (c) => {
    if (includeClasses.length > 0) {
      return includeClasses.some((n) => c.Name.toLowerCase().includes(n))
    } else if (excludeClasses.length > 0) {
      return !excludeClasses.some((n) => c.Name.toLowerCase().includes(n))
    } else {
      return true
    }
  }
}

/**
 * A wrapper that will race two login calls if the first character of the
 * password is capitalized. Apple Shortcuts will capitalize the first character
 * of the password when it is entered for the first time and people may not realise,
 * so we try both passwords and return the first one that succeeds.
 */
function loginWrapper(username: string, password: string): ReturnType<typeof login> {
  const passwordAlt = password.slice(0, 1).toLowerCase() + password.slice(1)
  if (password === passwordAlt) {
    return login(username, password)
  }
  return Promise.any([login(username, password), login(username, passwordAlt)]).catch((e: AggregateError) =>
    // return the first error instead of the AggregateError
    Promise.reject(e.errors[0])
  )
}
