import { preloadApiCache } from '../wodify'

async function main() {
  const start = Date.now()
  console.log(await preloadApiCache())
  console.log('Took', Date.now() - start, 'ms')
}

main()
