import assert from 'node:assert/strict'
import fs from 'node:fs'
import { formatWorkout, getPrimaryWorkout } from '../src/wodify/format.js'

const directory = new URL('./workouts/', import.meta.url)
const files = fs.readdirSync(directory).filter((file) => file.endsWith('.json'))
assert(files.length > 0, 'Expected saved workout fixtures')

for (const file of files) {
  const components = JSON.parse(fs.readFileSync(new URL(file, directory), 'utf8'))
  assert.equal(typeof formatWorkout(components), 'string', file)
  assert.equal(typeof formatWorkout(getPrimaryWorkout(components)), 'string', file)
}

console.log(`PASS: full and primary formatting smoke tests for ${files.length} saved workouts`)
