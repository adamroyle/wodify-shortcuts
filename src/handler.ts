import type { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import crypto from 'crypto'

import { getWorkout, signin } from './functions.js'

export const getWorkoutHandler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')
  const includeSections = formData.getAll('include_section').flatMap(splitAndTrim).filter(Boolean)
  const excludeSections = formData.getAll('exclude_section').flatMap(splitAndTrim).filter(Boolean)

  if (!date || !email || !password) {
    console.error('Date, email and password are required.')
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  // preset for CrossFit CrossAxed
  if (event.rawPath == '/workout-main') {
    includeSections.push('Pre-Metcon')
    includeSections.push('Metcon')
  }

  try {
    console.log({ user: hash(email), date, includeSections, excludeSections })
    return {
      statusCode: 200,
      body: await getWorkout({ username: email, password, date, includeSections, excludeSections }),
    }
  } catch (error: any) {
    console.error(error.message, { user: hash(email), date, includeSections, excludeSections })
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

  // preset for CrossFit CrossAxed
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
