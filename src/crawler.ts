import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import pinataSDK from '@pinata/sdk'
import assert from 'assert'
import { fetchIpfsFriends, resolveIpfsDnsLink, validCID, validHost } from './lib'

// config
const dwebPath = '.well-known/dweb-friends.txt'

// use the .env file
require('dotenv').config({ path: '.env' })

const pinata = pinataSDK(process.env.IPFS_DEPLOY_PINATA__API_KEY as string, process.env.IPFS_DEPLOY_PINATA__SECRET_API_KEY as string)

const argv = yargs(hideBin(process.argv))
  .options({
    v: { alias: 'verbose', type: 'boolean', default: false },
    d: { alias: 'dry-run', description: "Dry run to avoid writing anything to Pinata", type: 'boolean', default: false },
  }).parseSync()

main(process.argv[2])
  .catch(console.error)

async function main (entryHost: string) {
  assert(validHost(entryHost), 'Bad host given ' + entryHost)
  const ipfsFriendsTxt = await fetchIpfsFriends(entryHost, dwebPath)

  // split by new line,
  // whitespace-trim each line
  // remove empty lines
  const lines = ipfsFriendsTxt.split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.startsWith('#'))

  const myFriendsHosts = lines.filter(validHost)
  const myFriendsCIDs = lines.filter(validCID)

  const hashHost: [string,string][] = (await Promise.all(
      myFriendsHosts.map(host => resolveIpfsDnsLink(host)
        .then((hash):[string, string] => [
          hash || '', host
        ]))
    ))
    .filter(t => t[0].length > 0)

  if (argv.d) {
    // @ts-ignore
    pinata.pinByHash = (h) => new Promise(res => res(console.log("would have pinned "+h) || {}))
  }

  hashHost.push(...myFriendsCIDs.map((h):[string,string] => [h, '']))
  console.log('Pinning to Pinata')
  console.log(hashHost.map(h => h[0] + `${h[1] && ` (${h[1]})`}`))

  const responses = await Promise.all(
    hashHost
      .map(([hash, host]) => pinata.pinByHash(hash, { pinataMetadata: { name: `ipfs friend${host && ` (${host})`}` } }))
  )
  argv.v && Array.isArray(responses) && console.debug(responses)
  console.log('Done!')
}

