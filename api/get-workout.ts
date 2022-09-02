import type { VercelRequest, VercelResponse } from '@vercel/node'

import { login, listWorkoutComponents, formatWorkout, getPrimaryWorkout } from '../wodify.js'

export default async (request: VercelRequest, response: VercelResponse) => {
  const { date, email, password } = request.body

  if (!date || !email || !password) {
    console.error('Date, email and password are required.', { date, email })
    return response.status(400).send('Date, email and password are required.')
  }

  try {
    const session = await login(email, password)
    const workout = await listWorkoutComponents(session, date)
    response.status(200).send(formatWorkout(getPrimaryWorkout(workout)) || 'Oh no! There is no workout posted.')
  } catch (error: any) {
    console.error(error.message, { email, date })
    response.status(500).send(error.message)
  }
}
