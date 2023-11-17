import fs from 'fs'
import { formatWorkout, getPrimaryWorkout } from '../src/wodify/format.js'

const DIR = 'scripts/workouts'

const date = '2023-11-14'

function main() {
  const file = `${date}.json`
  const components = JSON.parse(fs.readFileSync(`${DIR}/${file}`, 'utf8'))

  const formatted = formatWorkout(components)
  console.log(formatted)

  // const formattedPrimary = formatWorkout(getPrimaryWorkout(components))
  // console.log(formattedPrimary)
}

main()
