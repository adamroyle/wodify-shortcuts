import { preloadApiCache } from '../src/wodify/network'

async function main() {
  const start = Date.now()
  console.log(await preloadApiCache())
  console.log('Took', Date.now() - start, 'ms')
}

main()
