import { getAllWorkouts } from '../src/functions'

async function main(username: string, password: string, dateStart: string, dateEnd: string) {
  const start = Date.now()

  try {
    const workout = await getAllWorkouts({ username, password, dateStart, dateEnd })
    console.log(workout)
  } catch (e: any) {
    console.log('Error:', e.message)
  }

  console.log('Took', Date.now() - start, 'ms')
}

main(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
