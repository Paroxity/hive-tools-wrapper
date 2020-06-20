Hive Tools Wrapper
=========
Advanced Hive Bedrock API wrapper with caching.

## Installation
  `npm install hive-tools-wrapper`

## Getting started
*Work in progress.*
```js
import HiveApi from "hive-tools-wrapper/lib/HiveApi"

// Make a new HiveApi instance, with a 300 second cache.
let api = new HiveApi(300)

// Get player data from the Hive API.
api.getAllTimePlayerStatistics("wars", "NeutronicMC").then((response) => {
    // Return the all-time win count for NeutronicMC.
    console.log(response.victories);
});
```

## Tests

  `npm test`
