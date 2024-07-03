import { login, listWorkoutComponents, listClasses, signinClass, getGymDateTime } from './wodify/api.js'
import { getPrimaryWorkout, excludeExtras, excludeScaled, excludeWarmup, formatWorkout } from './wodify/format.js'
import { Class, ReservationStatusId } from './wodify/types.js'

type GetWorkoutParams = {
  username: string
  password: string
  date: string
  includeWarmup: boolean
  includeExtras: boolean
  includeScaled: boolean
}

export async function getWorkout({
  username,
  password,
  date,
  includeWarmup,
  includeExtras,
  includeScaled,
}: GetWorkoutParams): Promise<string> {
  const session = await loginWrapper(username, password)
  // hack for crossfit crossaxed - if gym program is "CrossFit", change it to "CrossFit GPP"
  const programId = session.User.GymProgramId === '20714' ? '109084' : session.User.GymProgramId
  let workout = await listWorkoutComponents(session, date, programId)
  if (!includeWarmup) {
    workout = excludeWarmup(workout)
  }
  if (!includeExtras) {
    workout = excludeExtras(workout)
  }
  if (!includeScaled) {
    workout = excludeScaled(workout)
  }
  return formatWorkout(workout) || 'Oh no! There is no workout posted.'
}

type GetAllWorkoutsParams = {
  username: string
  password: string
  dateStart: string
  dateEnd: string
}

export async function getAllWorkouts({
  username,
  password,
  dateStart,
  dateEnd,
}: GetAllWorkoutsParams): Promise<string> {
  const session = await loginWrapper(username, password)
  // hack for crossfit crossaxed - if gym program is "CrossFit", change it to "CrossFit GPP"
  const programId = session.User.GymProgramId === '20714' ? '109084' : session.User.GymProgramId
  const dateRange = getDateRange(dateStart, dateEnd)
  let workouts = await Promise.allSettled(
    dateRange.map(async (date) => {
      let workoutComponents = await listWorkoutComponents(session, date, programId)
      let workout = formatWorkout(getPrimaryWorkout(workoutComponents))
      if (!workout) {
        throw new Error('No workout posted')
      }
      return workout
    })
  )

  return workouts
    .map((w, i) => {
      if (w.status === 'fulfilled') {
        return `${getDayName(dateRange[i]).toUpperCase()}\n\n${w.value || ''}`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n\n')
}

type SigninParams = {
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
  const [gymTime, classes] = await Promise.all([getGymDateTime(session), listClasses(session, date)])
  const filteredClasses = classes.filter(createClassesFilter(includeClasses, excludeClasses))
  const alreadySignedIn = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.SignedIn)
  const alreadyReserved = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.Reserved)
  const nextAvailable = filteredClasses.find(
    (c) =>
      c.ClassReservationStatusId === ReservationStatusId.None &&
      c.IsAvailable &&
      // if signing in for today, only show future classes
      (date === gymTime.GymCurrDate ? c.StartTime >= gymTime.GymCurrTime : true)
  )
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
    let include = true
    if (includeClasses.length > 0) {
      include = includeClasses.some((n) => c.Name.toLowerCase().includes(n))
    }
    if (include && excludeClasses.length > 0) {
      include = !excludeClasses.some((n) => c.Name.toLowerCase().includes(n))
    }
    return include
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

function getDateRange(dateStart: string, dateEnd: string): string[] {
  const dateRange = []
  const start = new Date(dateStart)
  const end = new Date(dateEnd)
  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    dateRange.push(date.toISOString().slice(0, 10))
  }
  return dateRange
}

function getDayName(date: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(date).getDay()]
}
