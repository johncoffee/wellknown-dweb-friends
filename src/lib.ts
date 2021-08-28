import cids from 'cids'
import fetch from 'node-fetch'

export async function fetchIpfsFriends (host: string, dwebPath = '.well-known/dweb-friends.txt'): Promise<string> {
  const url = `https://${host}/${dwebPath}`
  console.log('Fetching '+url)
  const res = await fetch(url)
  if (res.status !== 200) {
    throw new Error(await res.text())
  }
  return res.text()
}

export async function resolveIpfsDnsLink (hostname: string): Promise<string | undefined> {
  if (!hostname.startsWith('_dnslink.')) {
    hostname = `_dnslink.${hostname}`
  }
  const res = await fetch(`https://cloudflare-dns.com/dns-query?type=TXT&name=${hostname}`,
    { headers: { 'accept': 'application/dns-json' } })
  const json = await res.json()

  if (!Array.isArray(json?.Answer)) return

  const entries: string[] = json.Answer
    .map((value: any) => value.data.match(/dnslink=\/ipfs\/(\w+)/i)?.[1])
    .map((data: string | undefined) => (data || '').toString())
    .filter((v: string) => v.length > 0)
    .filter((data: string) => validCID(data))

  return entries[0]
}

export function validCID (str: string) {
  try {
    return new cids(str)
  } catch {}
}

export function validHost (host: string): boolean | undefined {
  try {
    // Using URL to validate input as a hostname without port
    return host + '.tld' === new URL(`http://${host}.tld:3000`).hostname
  } catch {
  }
}