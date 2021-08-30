# wellknown-dweb-friends

Sharing is caring!

`wellknown-dweb-friends` is a proposal for something like social relations between web sites hosted
on the distributed web (IPFS is supported for now).      

The idea here is to list 'content hashes'/[CIDs](https://docs.ipfs.io/concepts/content-addressing/)
of friends' web pages, so all friends in the network can help out pinning each 
others stuff.

## Assumptions

We're using Pinata for pinning.

## Format

`.well-known/dweb-friends.txt`


dweb-friends.txt
```text/plain
# My friends:
docs.ipfs.io
zerosleep.dk

# Some random cool stuff
QmaVXeZXVTCYdYHhDiMkJjiLB7VGchLP2Gp14rD2jq565K
```

# Usage
Install deps  
`npm install`

We can try uploading one of the example folder:
`ipfs-deploy -p pinata -d cloudflare -C -H example/www.alice.com`

Now you can run the crawler that finds & pins dweb friends:
`npx ts-node src/crawler.ts example.com -v`

Discussion
============

Next version features:
- [x] Should it support CIDs also?
- [ ] What about fully qualified dweb links `/ipfs/Qm123XyZ` or `/ipns/example.com`?
- [ ] Pin a single file? `/ipfs/Qm12..3Xy/Sintel.mp4` (it's always Sintel :D)
- [ ] Dat+Hashbase support would be cool
