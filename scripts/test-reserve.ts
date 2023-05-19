import { listClasses, login, reserveClass } from '../src/wodify/api'
import { Class, ReservationStatusId } from '../src/wodify/types'

type ReserveParams = {
  username: string
  password: string
  date: string
  includeClasses: string[]
  excludeClasses: string[]
}

export async function reserve({
  username,
  password,
  date,
  includeClasses,
  excludeClasses,
}: ReserveParams): Promise<string> {
  const session = await login(username, password)
  const classes = await listClasses(session, date)
  const filteredClasses = classes.filter(createClassesFilter(includeClasses, excludeClasses))
  const alreadySignedIn = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.SignedIn)
  const alreadyReserved = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.Reserved)
  const nextAvailable = filteredClasses.find((c) => c.ClassReservationStatusId === ReservationStatusId.None && c.IsAvailable) // prettier-ignore

  if (alreadySignedIn) {
    return `You are already signed in to ${alreadySignedIn.Name}`
  } else if (alreadyReserved) {
    return `You are already reserved for ${alreadyReserved.Name}`
  } else if (nextAvailable) {
    const status = await reserveClass(session, nextAvailable.Id)
    if (status.NewStatusId === ReservationStatusId.Reserved) {
      return `You are now reserved for ${nextAvailable.Name}`
    }
    return `Sorry, I was unable to reserve you in to ${nextAvailable.Name}`
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

async function main(username: string, password: string, date: string) {
  const start = Date.now()

  try {
    const result = await reserve({ username, password, date, includeClasses: ['06:15'], excludeClasses: [] })
    console.log(result)
  } catch (e: any) {
    console.log('Error:', e.message)
  }

  console.log('Took', Date.now() - start, 'ms')
}

main(process.argv[2], process.argv[3], process.argv[4])
