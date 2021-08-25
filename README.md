# wellknown-dweb-friends

The idea here is to list content hashes/[CIDs](https://docs.ipfs.io/concepts/content-addressing/)
of friends' web pages, so all friends in the network can help out pinning each others stuff.

## Version 0 assumptions

We're using Pinata for pinning.

## Format

`.well-known/dweb-friends.txt`


dweb-friends.txt
```text/plain
docs.ipfs.io
zerosleep.dk
```

Discussion
============

Next version features:
- [ ] Should it support CIDs also?
- [ ] What about fully qualified dweb links `/ipfs/Qm123XyZ`?
