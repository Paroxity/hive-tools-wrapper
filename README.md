# Hive Tools Wrapper

Advanced Hive Bedrock API wrapper with caching.

## Installation

`npm install hive-tools-wrapper`

## Getting started

_Work in progress._

```js
import HiveApi from "hive-tools-wrapper/lib/HiveApi";

// Set API cache to 300 seconds
HiveApi.setCacheTimeout(300);

// Get player data from the Hive API.
HiveApi.getAllTimePlayerStatistics("wars", "NeutronicMC").then(response => {
	// Return the all-time win count for NeutronicMC.
	console.log(response.victories);
});
```

## Tests

`npm test`
