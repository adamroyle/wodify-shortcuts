import puppeteer from 'puppeteer-core'
import { formatWorkout, getPrimaryWorkout, login, workoutComponentsForDate } from '../lib'
;(async () => {
  const EMAIL = process.argv[2]
  const PASSWORD = process.argv[3]

  const start = Date.now()

  if (!EMAIL) throw new Error('Email and password not supplied as arguments.')
  if (!PASSWORD) throw new Error('Password not supplied as arguments.')

  const browser = await puppeteer.launch({ headless: false, devtools: true })
  const page = await browser.newPage()

  await login(page, EMAIL, PASSWORD)
  const components = await workoutComponentsForDate(page, new Date('2022-07-29'))
  console.log(formatWorkout(getPrimaryWorkout(components)))
  // console.log(components)
  // await browser.close()

  const diff = Date.now() - start
  console.log(`Took ${diff}ms`)
})()
