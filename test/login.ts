import { login } from '../wodify'

async function main(username: string, password: string, date: string, classId: string) {
  const start = Date.now()

  try {
    const session = await login(username, password)
    console.log(session)

    // const programs = await listPrograms(session)
    // const classes = await listClasses(session, '2022-08-04')
    // const workout = await listWorkoutComponents(session, '2022-08-04')
    // const thing = await signinClass(session, classId:string)
    // console.log(thing)
    // const classAccess = await getClassAccess(session, classId:string)
    // console.log(classAccess)
  } catch (e: any) {
    console.log('Error:', e.message)
  }

  console.log('Took', Date.now() - start, 'ms')
}

main(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
