import fs from 'fs'
import { fixCrossAxedWorkoutComponents, formatWorkout, getPrimaryWorkout } from '../src/wodify/format.js'

const DIR = 'scripts/workouts'

function main() {
  // get directory listing
  const files = fs.readdirSync(DIR)
  // iterate each file
  for (const file of files) {
    const [basename, ext] = file.split('.')
    if (ext !== 'json') continue
    // parse file
    const components = fixCrossAxedWorkoutComponents(JSON.parse(fs.readFileSync(`${DIR}/${file}`, 'utf8')))

    // format workout
    const formatted = formatWorkout(components)
    const formattedPrimary = formatWorkout(getPrimaryWorkout(components))
    // write formatted workout
    fs.writeFileSync(`${DIR}/${basename}.txt`, formatted)
    fs.writeFileSync(`${DIR}/${basename}_primary.txt`, formattedPrimary)
  }
}

main()
