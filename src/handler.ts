import type { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import crypto from 'crypto'

import { getAllWorkouts, getWorkout, signin } from './functions.js'

export const getWorkoutHandler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')
  const includeWarmup = formData.get('include_warmup') === '1'
  const includeExtras = formData.get('include_extras') === '1'

  if (!date || !email || !password) {
    console.error('Date, email and password are required.')
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    console.log({ user: hash(email), date, includeWarmup, includeExtras })
    return {
      statusCode: 200,
      body: await getWorkout({ username: email, password, date, includeWarmup, includeExtras }),
    }
  } catch (error: any) {
    console.error(error.message, { user: hash(email), date, includeWarmup, includeExtras })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}

export const getAllWorkoutsHandler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const dateStart = formData.get('dateStart')
  const dateEnd = formData.get('dateEnd')
  const email = formData.get('email')
  const password = formData.get('password')

  if (!dateStart || !dateEnd || !email || !password) {
    console.error('Start date, end date, email and password are required.')
    return {
      statusCode: 400,
      body: 'Start date, end date, email and password are required.',
    }
  }

  try {
    console.log({ user: hash(email), dateStart, dateEnd })
    return {
      statusCode: 200,
      body: await getAllWorkouts({ username: email, password, dateStart, dateEnd }),
    }
  } catch (error: any) {
    console.error(error.message, { user: hash(email), dateStart, dateEnd })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}

export const signinHandler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')
  const includeClasses = formData.getAll('include_class').flatMap(splitAndTrim).filter(Boolean)
  const excludeClasses = formData.getAll('exclude_class').flatMap(splitAndTrim).filter(Boolean)

  // backwards compatibility
  if (event.rawPath == '/signin-crossfit') {
    includeClasses.push('crossfit')
  }

  if (!date || !email || !password) {
    console.error('Date, email and password are required.')
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    const message = await signin({ username: email, password, date, includeClasses, excludeClasses })
    console.log(message, { user: hash(email), date, includeClasses, excludeClasses })
    return {
      statusCode: 200,
      body: message,
    }
  } catch (error: any) {
    console.error(error.message, { user: hash(email), date, includeClasses, excludeClasses })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}

function hash(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase(), 'utf8').digest('hex').slice(0, 8)
}

function splitAndTrim(str: string): string[] {
  return str.split('\n').map((s) => s.trim())
}
