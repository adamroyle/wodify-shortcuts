import type { Handler, APIGatewayEvent, ProxyResult } from 'aws-lambda'
import type { Browser } from 'puppeteer-core'

import chromium from 'chrome-aws-lambda'

import { formatWorkout, login, workoutComponentsForDate, getPrimaryWorkout } from './lib'

export const primaryWorkout: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  let result: string = ''
  let browser: Browser | null = null
  let c: any = null

  const date = event.queryStringParameters?.date
  const email = event.queryStringParameters?.email
  const password = event.queryStringParameters?.password

  if (!date || !email || !password) {
    return {
      statusCode: 500,
      body: 'Date, email and password are required.',
    }
  }

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()

    await login(page, email, password)
    const components = await workoutComponentsForDate(page, date)
    c = components
    result = formatWorkout(getPrimaryWorkout(components))

    await browser.close()
  } catch (error: any) {
    return {
      statusCode: 500,
      body: error.message,
    }
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ result, c }),
  }
}
