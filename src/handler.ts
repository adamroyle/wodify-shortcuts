import type { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getWorkout, signin } from './functions.js'

export const getWorkoutHandler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async (event) => {
  const formData = new URLSearchParams(Buffer.from(event.body || '', 'base64').toString('utf8'))
  const date = formData.get('date')
  const email = formData.get('email')
  const password = formData.get('password')
  const includeSections = formData.getAll('include_section').filter(Boolean)
  const excludeSections = formData.getAll('exclude_section').filter(Boolean)

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
      body: await getWorkout({ username: email, password, date, includeSections, excludeSections }),
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
  const includeClasses = formData.getAll('include_class').filter(Boolean)
  const excludeClasses = formData.getAll('exclude_class').filter(Boolean)

  // backwards compatibility
  if (event.rawPath == '/signin-crossfit') {
    includeClasses.push('crossfit')
  }

  if (!date || !email || !password) {
    console.error('Date, email and password are required.', { date, email })
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  try {
    const message = await signin({ username: email, password, date, includeClasses, excludeClasses })
    console.log(message, { email, date, includeClasses, excludeClasses })
    return {
      statusCode: 200,
      body: message,
    }
  } catch (error: any) {
    console.error(error.message, { email, date, includeClasses, excludeClasses })
    return {
      statusCode: 500,
      body: error.message,
    }
  }
}
