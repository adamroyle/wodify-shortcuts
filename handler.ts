import type { Handler, APIGatewayEvent, ProxyResult, S3CreateEvent } from 'aws-lambda'
import type { GetObjectOutput } from 'aws-sdk/clients/s3'
import type { Browser } from 'puppeteer-core'
import aws from 'aws-sdk'
import chromium from 'chrome-aws-lambda'

import { formatWorkout, login, workoutComponentsForDate, getPrimaryWorkout } from './lib'

const BUCKET = process.env.BUCKET || ''

export const receiveRequest: Handler<APIGatewayEvent, ProxyResult> = async (event) => {
  const date = event.queryStringParameters?.date
  const email = event.queryStringParameters?.email
  const password = event.queryStringParameters?.password
  // const tz = event.queryStringParameters?.tz || 'Australia/Brisbane'

  if (!date || !email || !password) {
    return {
      statusCode: 400,
      body: 'Date, email and password are required.',
    }
  }

  const s3 = new aws.S3()

  try {
    const existingResponse = await s3.getObject({ Bucket: BUCKET, Key: buildResponseKey(email, date) }).promise()

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: existingResponse.Body?.toString() || '',
    }
  } catch (e) {
    // do nothing
  }

  let request: string | undefined

  try {
    const existingRequest = await s3.getObject({ Bucket: BUCKET, Key: buildRequestKey(email, date) }).promise()
    request = existingRequest.Body?.toString()
  } catch (e) {
    // do nothing
  }

  if (!request) {
    request = JSON.stringify({ email, password, date })
    try {
      await s3.putObject({ Bucket: BUCKET, Key: buildRequestKey(email, date), Body: request }).promise()
    } catch (e) {
      return {
        statusCode: 500,
        body: 'Failed to save request.',
      }
    }
  }

  return {
    statusCode: 202,
    body: 'Your request has been queued.',
  }
}

export const processRequest: Handler<S3CreateEvent> = async (event) => {
  const s3 = new aws.S3()
  const record = event.Records[0]
  const objectKey = decodeURIComponent(record.s3.object.key)

  let request: GetObjectOutput

  try {
    request = await s3.getObject({ Bucket: BUCKET, Key: objectKey }).promise()
  } catch (e) {
    console.log(`Failed to get request for ${objectKey}`)
    return
  }

  const parsedRequest = JSON.parse(request.Body?.toString() || '{}')

  const email = parsedRequest.email
  const password = parsedRequest.password
  const date = parsedRequest.date

  if (!date || !email || !password) {
    throw new Error('Request missing date, email or password.')
  }

  let browser: Browser | null = null

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      // env: { TZ: tz },
    })

    const page = await browser.newPage()

    await login(page, email, password)
    const components = await workoutComponentsForDate(page, date)
    // const result = formatWorkout(getPrimaryWorkout(components))
    const response = JSON.stringify({
      date,
      primaryWorkout: formatWorkout(getPrimaryWorkout(components)),
      completeWorkouts: formatWorkout(components),
      components,
    })

    await s3.putObject({ Bucket: BUCKET, Key: buildResponseKey(email, date), Body: response }).promise()
  } catch (error: any) {
    // ignore
  }

  if (browser !== null) {
    await browser.close()
  }

  await s3.deleteObject({ Bucket: BUCKET, Key: objectKey }).promise()
}

function buildRequestKey(email: string, date: string) {
  return `request/${date}_${email}.json`
}

function buildResponseKey(email: string, date: string) {
  return `response/${date}_${email}.json`
}
