<!--
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

[![Version](https://img.shields.io/npm/v/@adobe/aio-lib-events.svg)](https://npmjs.org/package/@adobe/aio-lib-events)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-lib-events.svg)](https://npmjs.org/package/@adobe/aio-lib-events)
[![Build Status](https://travis-ci.com/adobe/aio-lib-events.svg?branch=master)](https://travis-ci.com/adobe/aio-lib-events)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/aio-lib-events.svg)](https://greenkeeper.io/)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-events/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-events/)

# Adobe I/O Events Lib

### Installing

```bash
$ npm install @adobe/aio-lib-events
```

### Usage
1) Initialize the SDK

```javascript
const sdk = require('@adobe/aio-lib-events')

async function sdkTest() {
  //initialize sdk
  const client = await sdk.init('<organization id>', 'x-api-key', '<valid auth token>', '<options>')
}
```

2) Call methods using the initialized SDK

```javascript
const sdk = require('@adobe/aio-lib-events')

async function sdkTest() {
  // initialize sdk
  const client = await sdk.init('<organization id>', 'x-api-key', '<valid auth token>', '<options>')

  // call methods
  try {
    // get profiles by custom filters
    const result = await client.getSomething({})
    console.log(result)

  } catch (e) {
    console.error(e)
  }
}
```

3) Using the poller for journalling

```javascript
const sdk = require('@adobe/aio-lib-events')

async function sdkTest() {
  // initialize sdk
  const client = await sdk.init('<organization id>', 'x-api-key', '<valid auth token>', '<http options>')
  // get the journalling observable
  const journalling = client.getEventsObservableFromJournal('<journal url>', '<journalling options>')
  // call methods
  const subscription = journalling.subscribe({
    next: (v) => console.log(v), // Action to be taken on event
    error: (e) => console.log(e), // Action to be taken on error
    complete: () => console.log('Complete') // Action to be taken on complete
  })
  
  // To stop receiving events from this subscription based on a timeout
  setTimeout(() => this.subscription.unsubscribe(), <timeout in ms>)
}

``` 
One observable can have multiple subscribers. Each subscription can be handled differently.
For more details on using the poller for Journalling check <a href="#EventsCoreAPI+getEventsObservableFromJournal">getEventsObservableFromJournal</a>

{{>main-index~}}
{{>all-docs~}}

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
