import fs from 'fs'
import { listWorkoutComponents, login } from '../src/wodify/api'

async function main(username: string, password: string) {
  const session = await login(username, password)
  // iterate each day from 1 month ago
  const today = new Date()
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  const days = []
  for (let d = oneMonthAgo; d <= today; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  // fetch workouts
  for (const day of days) {
    const date = day.toISOString().split('T')[0]
    const workout = await listWorkoutComponents(session, date)
    if (workout.length) {
      fs.writeFileSync(`test/workouts/${date}.json`, JSON.stringify(workout, null, 2))
    }
  }
}

main(process.argv[2], process.argv[3])
