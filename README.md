![GitHub package.json version](https://img.shields.io/github/package-json/v/LupCode/node-lup-expires)
![npm bundle size](https://img.shields.io/bundlephobia/min/lup-expires)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/LupCode/node-lup-expires/on-push.yml?branch=main)
![NPM](https://img.shields.io/npm/l/lup-expires)

# lup-expires
Offers different data structures that allow temporary storing of objects. 
Expire time can be defined for stored entries after which they will get automatically deleted.

> This package is **deprecated**.
> Please use [lup-structures](https://www.npmjs.com/package/lup-structures) instead which includes all features of lup-expires and more.


## JavaScript Example

```javascript
const { ExpireMap } = require("lup-expires);

const map = new ExpireMap({
    defaultExpire: 1000, // Default expire time in milliseconds.
    extendLifespanOnTouch: false, // If true, the lifespan of the entry will be extended on every access of that element.
});
map.set("key1", "value1"); // Will expire in 1000ms
map.set("key2", "value2", 2000); // Will expire in 2000ms

```


## TypeScript Example

```typescript
import { ExpireMap } from "lup-expires"

const map = new ExpireMap<string, string>({
    defaultExpire: 1000, // Default expire time in milliseconds.
    extendLifespanOnTouch: false, // If true, the lifespan of the entry will be extended on every access of that element.
});
map.set("key1", "value1"); // Will expire in 1000ms
map.set("key2", "value2", 2000); // Will expire in 2000ms

```