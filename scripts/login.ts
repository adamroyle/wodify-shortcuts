import { login, listClasses, getCustomerDateTime } from '../src/wodify/api'

async function main(username: string, password: string, date: string) {
  const start = Date.now()

  try {
    const session = await login(username, password)
    console.log(session)
    const dateTime = await getCustomerDateTime(session)
    console.log(dateTime)
    const classes = await listClasses(session, date)
    console.log(classes)
  } catch (e: any) {
    console.log('Error:', e.message)
  }

  console.log('Took', Date.now() - start, 'ms')
}

main(process.argv[2], process.argv[3], process.argv[4])
