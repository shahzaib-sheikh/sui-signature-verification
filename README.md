### sui-signature-verification

## Setup

```bash

yarn

sui move build

sui client publish --gas-budget 500000000 --json ./ 

```


Fetch deployed package id from response. Paste in `index.js`

```js
// ...

const packageID = '<packageID>';
const moduleName = 'ecdsa';
const method = 'verify_signature';
const method2 = 'get_public_key';

// ...
```

Run script 

```bash
node index.js
```