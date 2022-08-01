import puppeteer from 'puppeteer'
import type { Page } from 'puppeteer-core'
import { formatWorkout, getPrimaryWorkout, login, workoutComponentsForDate } from '../lib'

async function main(email: string, password: string, date: string) {
  const start = Date.now()

  if (!email) throw new Error('Email and password not supplied as arguments.')
  if (!password) throw new Error('Password not supplied as arguments.')

  const browser = await puppeteer.launch({ headless: false, devtools: true })
  const page = (await browser.newPage()) as unknown as Page

  await login(page, email, password)
  const components = await workoutComponentsForDate(page, date)
  console.log(formatWorkout(getPrimaryWorkout(components)))
  // console.log(components)
  await browser.close()

  const diff = Date.now() - start
  console.log(`Took ${diff}ms`)
}

main(process.argv[2], process.argv[3], process.argv[4])
