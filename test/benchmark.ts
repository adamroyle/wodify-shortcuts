/*
 * What is this?
 *
 * I wanted to benchmark a lambda function from different regions
 * to see if there was any significant difference in latency when
 * requested from Brisbane, Australia. This would help inform which
 * region would give the best response times.
 *
 * Setup
 *
 * 1. I deployed the lambda functions to each region using the serverless framework.
 *    eg. sls deploy --stage test --region ap-southeast-2
 * 2. I copied the API endpoint URLs into the regions array below.
 * 3. I ran the test in the terminal and copied the results into a spreadsheet.
 *    eg. ts-node test/benchmark.ts email@example.com password 2022-10-01
 *
 * Results
 *
 * us-east-1 was the fastest, followed closely by all other us regions (within about 200-400ms).
 * ap-southeast-2 was the slowest, by about 1000ms.
 *
 * You can find my raw data here:
 * https://docs.google.com/spreadsheets/d/1iRTG26NRS9x5z9yYNXkitA2CIdc7fCiC7fqoxYN5ovk/edit?usp=sharing
 */

import fetch from 'node-fetch'

interface Region {
  name: string
  url: string
}

// NOTE: these URLs are not valid (anymore), you need to replace them with your own
const regions: Region[] = [
  { name: 'ap-southeast-2', url: 'https://841kwj4dra.execute-api.ap-southeast-2.amazonaws.com/workout' },
  { name: 'us-east-1', url: 'https://dm0a74xuy9.execute-api.us-east-1.amazonaws.com/workout' },
  { name: 'us-east-2', url: 'https://8l643lw4p8.execute-api.us-east-2.amazonaws.com/workout' },
  { name: 'us-west-1', url: 'https://45fpxj2cph.execute-api.us-west-1.amazonaws.com/workout' },
  { name: 'us-west-2', url: 'https://fyx2hqmlwk.execute-api.us-west-2.amazonaws.com/workout' },
]

async function main(username: string, password: string, date: string) {
  const iterations = 10

  for (const region of regions) {
    for (let i = 0; i < iterations; i++) {
      const start = Date.now()
      const response = await fetch(region.url, {
        method: 'POST',
        body: Buffer.from(`date=${date}&email=${username}&password=${password}`).toString('base64'),
      })
      const end = Date.now()
      const time = end - start
      console.log(`${response.status}\t${region.name}\t${time}`)
    }
  }
}

main(process.argv[2], process.argv[3], process.argv[4])
