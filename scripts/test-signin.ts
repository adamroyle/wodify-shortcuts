import { signin } from '../src/functions'

async function main(username: string, password: string, date: string) {
  const start = Date.now()

  try {
    const result = await signin({ username, password, date, includeClasses: ['crossfit'], excludeClasses: [] })
    console.log(result)
  } catch (e: any) {
    console.log('Error:', e.message)
  }

  console.log('Took', Date.now() - start, 'ms')
}

main(process.argv[2], process.argv[3], process.argv[4])
