import type { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getWorkout, signin } from './functions.js'

export const getWorkoutHandler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')

  if (!date || !email || !password) {
    console.error('Date, email and password are required.', { date, email })
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    return {
      statusCode: 200,
      body: await getWorkout(email, password, date),
    }
  } catch (error: any) {
    console.error(error.message, { email, date })
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
  const className = event.rawPath == '/signin-crossfit' ? 'crossfit' : formData.get('class') || ''

  if (!date || !email || !password) {
    console.error('Date, email and password are required.', { date, email })
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    const message = await signin(email, password, date, className)
    console.log(message, { email, date, className })
    return {
      statusCode: 200,
      body: message,
    }
  } catch (error: any) {
    console.error(error.message, { email, date, className })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}
