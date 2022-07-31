import puppeteer from 'puppeteer'
import { formatWorkout, login, primaryWorkout, workoutComponentsForDate } from '../src'
;(async () => {
  const EMAIL = process.argv[2]
  const PASSWORD = process.argv[3]

  if (!EMAIL) throw new Error('Email and password not supplied as arguments.')
  if (!PASSWORD) throw new Error('Password not supplied as arguments.')

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await login(page, EMAIL, PASSWORD)
  const components = await workoutComponentsForDate(page, new Date('2022-07-29'))
  console.log(formatWorkout(primaryWorkout(components)))
  // console.log(components)
  await browser.close()
})()
