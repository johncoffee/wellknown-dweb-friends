#!/usr/bin/env ts-node

import fetch from 'node-fetch'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import pinataSDK from '@pinata/sdk'
import assert from 'assert'
// use the .env file
require('dotenv').config({ path: '.env' })

const argv = yargs(hideBin(process.argv))
  .options({
    v: { alias: 'verbose', type: 'boolean', default: false },
  }).parseSync()

main(process.argv[2])
  .catch(console.error)

async function main (entryHost: string) {
  assert(validHost(entryHost), 'Bad host given ' + entryHost)
  console.log('resolving dweb friends for ' + entryHost)

  // pinata
  const myFriends = (await fetchIpfsFriends(entryHost))
    .filter(line => !line.trim().startsWith('#'))
    .filter(validHost)

  console.log('My friends ', myFriends.join(', '))
  const friendsHashes: string[] = (await Promise.all(
    myFriends.map(host => resolveIpfsDnsLink(host))
  ))
    // securing we have a list of strings
    .map(h => (h || '').toString()).filter(h => !!h)

  const pinata = pinataSDK(process.env.IPFS_DEPLOY_PINATA__API_KEY as string, process.env.IPFS_DEPLOY_PINATA__SECRET_API_KEY as string)

  console.log('Pinning (pinata):', friendsHashes)
  const responses = await Promise.all(
    friendsHashes
      .map((hash, idx) => pinata.pinByHash(hash as string, { pinataMetadata: { name: 'ipfs friend ' + idx } }))
  )
  argv.v && Array.isArray(responses) && console.debug(responses)
  console.log('done!')
}

async function fetchIpfsFriends (hostname: string): Promise<string[]> {
  const url = `https://${hostname}/.well-known/dweb-friends.txt`
  const res = await fetch(url)
  if (res.status !== 200) {
    throw new Error(await res.text())
  }
  const contents = await res.text()
  // split by new line,
  // whitespace-trim each line
  // remove empty strings
  const lines = contents.split(/\n+/)
    .map(line => line.trim())
    .filter(line => !!line)
  return lines
}

function validHost (host: string): boolean | undefined {
  try {
    // Using URL to validate input as a hostname without port
    return host === new URL(`http://${host}:3000`).hostname
  } catch {
  }
}

async function resolveIpfsDnsLink (hostname: string): Promise<string | undefined> {
  if (!hostname.startsWith('_dnslink.')) {
    hostname = `_dnslink.${hostname}`
  }
  const res = await fetch(`https://cloudflare-dns.com/dns-query?type=TXT&name=${hostname}`,
    { headers: { 'accept': 'application/dns-json' } })
  const json = await res.json()

  if (!Array.isArray(json?.Answer)) return

  const entries: string[] = json.Answer
    .map((value: any) => value.data.match(/dnslink=\/ipfs\/(\w+)/i)?.[1])
    .map((data: string | undefined) => (data || '').toString().trim())
    .filter((data: string) => !!data)

  console.log(`entries for ${hostname}:`, entries)
  return entries[0]
}
