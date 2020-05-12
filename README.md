<!--
Copyright 2020 Adobe. All rights reserved.
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

## Classes

<dl>
<dt><a href="#EventsCoreAPI">EventsCoreAPI</a></dt>
<dd><p>This class provides methods to call your Adobe I/O Events APIs.
Before calling any method initialize the instance by calling the <code>init</code> method on it
with valid values for organizationId, apiKey, accessToken and optional http options such as timeout
and max number of retries</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#init">init(organizationId, apiKey, accessToken, [httpOptions])</a> ⇒ <code><a href="#EventsCoreAPI">Promise.&lt;EventsCoreAPI&gt;</a></code></dt>
<dd><p>Returns a Promise that resolves with a new EventsCoreAPI object.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#EventsCoreAPIOptions">EventsCoreAPIOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#EventsJournalOptions">EventsJournalOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#EventsJournalPollingOptions">EventsJournalPollingOptions</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="EventsCoreAPI"></a>

## EventsCoreAPI
This class provides methods to call your Adobe I/O Events APIs.
Before calling any method initialize the instance by calling the `init` method on it
with valid values for organizationId, apiKey, accessToken and optional http options such as timeout
and max number of retries

**Kind**: global class  

* [EventsCoreAPI](#EventsCoreAPI)
    * [.httpOptions](#EventsCoreAPI+httpOptions)
    * [.organizationId](#EventsCoreAPI+organizationId)
    * [.apiKey](#EventsCoreAPI+apiKey)
    * [.accessToken](#EventsCoreAPI+accessToken)
    * [.init(organizationId, apiKey, accessToken, [httpOptions])](#EventsCoreAPI+init) ⇒ [<code>Promise.&lt;EventsCoreAPI&gt;</code>](#EventsCoreAPI)
    * [.getAllProviders(consumerOrgId)](#EventsCoreAPI+getAllProviders) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getProvider(providerId, [fetchEventMetadata])](#EventsCoreAPI+getProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createProvider(consumerOrgId, projectId, workspaceId, body)](#EventsCoreAPI+createProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.updateProvider(consumerOrgId, projectId, workspaceId, providerId, body)](#EventsCoreAPI+updateProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteProvider(consumerOrgId, projectId, workspaceId, providerId)](#EventsCoreAPI+deleteProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getAllEventMetadataForProvider(providerId)](#EventsCoreAPI+getAllEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getEventMetadataForProvider(providerId, eventCode)](#EventsCoreAPI+getEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createEventMetadataForProvider(consumerOrgId, projectId, workspaceId, providerId, body)](#EventsCoreAPI+createEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.updateEventMetadataForProvider(consumerOrgId, projectId, workspaceId, providerId, eventCode, body)](#EventsCoreAPI+updateEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteEventMetadata(consumerOrgId, projectId, workspaceId, providerId, eventCode)](#EventsCoreAPI+deleteEventMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteAllEventMetadata(consumerOrgId, projectId, workspaceId, providerId)](#EventsCoreAPI+deleteAllEventMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createWebhookRegistration(consumerOrgId, integrationId, body)](#EventsCoreAPI+createWebhookRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getWebhookRegistration(consumerOrgId, integrationId, registrationId)](#EventsCoreAPI+getWebhookRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getAllWebhookRegistrations(consumerOrgId, integrationId)](#EventsCoreAPI+getAllWebhookRegistrations) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteWebhookRegistration(consumerOrgId, integrationId, registrationId)](#EventsCoreAPI+deleteWebhookRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.publishEvent(cloudEvent)](#EventsCoreAPI+publishEvent) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getEventsFromJournal(journalUrl, [eventsJournalOptions])](#EventsCoreAPI+getEventsFromJournal) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getEventsObservableFromJournal(journalUrl, [eventsJournalOptions], [eventsJournalPollingOptions])](#EventsCoreAPI+getEventsObservableFromJournal) ⇒ <code>Observable</code>
    * [.verifySignatureForEvent(event, clientSecret, signatureHeaderValue)](#EventsCoreAPI+verifySignatureForEvent) ⇒ <code>boolean</code>

<a name="EventsCoreAPI+httpOptions"></a>

### eventsCoreAPI.httpOptions
Http options {retries, timeout}

**Kind**: instance property of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
<a name="EventsCoreAPI+organizationId"></a>

### eventsCoreAPI.organizationId
The organization id from your integration

**Kind**: instance property of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
<a name="EventsCoreAPI+apiKey"></a>

### eventsCoreAPI.apiKey
The api key from your integration

**Kind**: instance property of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
<a name="EventsCoreAPI+accessToken"></a>

### eventsCoreAPI.accessToken
The JWT Token for the integration with IO Management API scope

**Kind**: instance property of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
<a name="EventsCoreAPI+init"></a>

### eventsCoreAPI.init(organizationId, apiKey, accessToken, [httpOptions]) ⇒ [<code>Promise.&lt;EventsCoreAPI&gt;</code>](#EventsCoreAPI)
Initialize SDK.

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: [<code>Promise.&lt;EventsCoreAPI&gt;</code>](#EventsCoreAPI) - returns object of the class EventsCoreAPI  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | The organization id from your integration |
| apiKey | <code>string</code> | The api key from your integration |
| accessToken | <code>string</code> | JWT Token for the integration with IO Management API scope |
| [httpOptions] | [<code>EventsCoreAPIOptions</code>](#EventsCoreAPIOptions) | Options to configure API calls |

<a name="EventsCoreAPI+getAllProviders"></a>

### eventsCoreAPI.getAllProviders(consumerOrgId) ⇒ <code>Promise.&lt;object&gt;</code>
Fetch all the providers

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns list of providers for the org  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |

<a name="EventsCoreAPI+getProvider"></a>

### eventsCoreAPI.getProvider(providerId, [fetchEventMetadata]) ⇒ <code>Promise.&lt;object&gt;</code>
Fetch a provider

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns the provider specified by the provider id  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| providerId | <code>string</code> |  | The id that uniquely identifies the provider to be fetched |
| [fetchEventMetadata] | <code>boolean</code> | <code>false</code> | Set this to true if you want to fetch the associated eventmetadata of the provider |

<a name="EventsCoreAPI+createProvider"></a>

### eventsCoreAPI.createProvider(consumerOrgId, projectId, workspaceId, body) ⇒ <code>Promise.&lt;object&gt;</code>
Create a new provider given the provider details

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns the details of the provider created  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| body | <code>object</code> | Json data that describes the provider |

<a name="EventsCoreAPI+updateProvider"></a>

### eventsCoreAPI.updateProvider(consumerOrgId, projectId, workspaceId, providerId, body) ⇒ <code>Promise.&lt;object&gt;</code>
Update a provider given the id and provider details

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns the details of the provider updated  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| providerId | <code>string</code> | The id that uniquely identifies the provider to be updated |
| body | <code>object</code> | Json data that describes the provider |

<a name="EventsCoreAPI+deleteProvider"></a>

### eventsCoreAPI.deleteProvider(consumerOrgId, projectId, workspaceId, providerId) ⇒ <code>Promise.&lt;object&gt;</code>
Delete a provider given the id

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns an empty object if the deletion was successful  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| providerId | <code>string</code> | The id that uniquely identifies the provider to be deleted |

<a name="EventsCoreAPI+getAllEventMetadataForProvider"></a>

### eventsCoreAPI.getAllEventMetadataForProvider(providerId) ⇒ <code>Promise.&lt;object&gt;</code>
Get all event metadata for a provider

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - List of all event metadata of the provider  

| Param | Type | Description |
| --- | --- | --- |
| providerId | <code>string</code> | The id that uniquely identifies the provider whose event metadata is to be fetched |

<a name="EventsCoreAPI+getEventMetadataForProvider"></a>

### eventsCoreAPI.getEventMetadataForProvider(providerId, eventCode) ⇒ <code>Promise.&lt;object&gt;</code>
Get an event metadata for given provider and event code

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Event metadata that corresponds to the specified event code  

| Param | Type | Description |
| --- | --- | --- |
| providerId | <code>string</code> | The id that uniquely identifies the provider whose event metadata is to be fetched |
| eventCode | <code>string</code> | The specific event code for which the details of the event metadata is to be fetched |

<a name="EventsCoreAPI+createEventMetadataForProvider"></a>

### eventsCoreAPI.createEventMetadataForProvider(consumerOrgId, projectId, workspaceId, providerId, body) ⇒ <code>Promise.&lt;object&gt;</code>
Create an event metadata for a provider

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the event metadata created  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| providerId | <code>string</code> | provider for which the event metadata is to be added |
| body | <code>object</code> | Json data that describes the event metadata |

<a name="EventsCoreAPI+updateEventMetadataForProvider"></a>

### eventsCoreAPI.updateEventMetadataForProvider(consumerOrgId, projectId, workspaceId, providerId, eventCode, body) ⇒ <code>Promise.&lt;object&gt;</code>
Update the event metadata for a provider

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the event metadata updated  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| providerId | <code>string</code> | provider for which the event metadata is to be updated |
| eventCode | <code>string</code> | eventCode of the event metadata to be updated |
| body | <code>object</code> | Json data that describes the event metadata |

<a name="EventsCoreAPI+deleteEventMetadata"></a>

### eventsCoreAPI.deleteEventMetadata(consumerOrgId, projectId, workspaceId, providerId, eventCode) ⇒ <code>Promise.&lt;object&gt;</code>
Delete an event metadata of a provider

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Empty object if deletion was successful  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| providerId | <code>string</code> | provider for which the event metadata is to be updated |
| eventCode | <code>string</code> | eventCode of the event metadata to be updated |

<a name="EventsCoreAPI+deleteAllEventMetadata"></a>

### eventsCoreAPI.deleteAllEventMetadata(consumerOrgId, projectId, workspaceId, providerId) ⇒ <code>Promise.&lt;object&gt;</code>
Delete all event metadata of a provider

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Empty object if deletion was successful  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| providerId | <code>string</code> | provider for which the event metadata is to be updated |

<a name="EventsCoreAPI+createWebhookRegistration"></a>

### eventsCoreAPI.createWebhookRegistration(consumerOrgId, integrationId, body) ⇒ <code>Promise.&lt;object&gt;</code>
Create a webhook or journal registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the webhook/journal registration created  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| integrationId | <code>string</code> | integration Id from the console |
| body | <code>object</code> | Json data contains details of the registration |

<a name="EventsCoreAPI+getWebhookRegistration"></a>

### eventsCoreAPI.getWebhookRegistration(consumerOrgId, integrationId, registrationId) ⇒ <code>Promise.&lt;object&gt;</code>
Get registration details for a given registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the webhook/journal registration  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| integrationId | <code>string</code> | Integration Id from the console |
| registrationId | <code>string</code> | Registration id whose details are to be fetched |

<a name="EventsCoreAPI+getAllWebhookRegistrations"></a>

### eventsCoreAPI.getAllWebhookRegistrations(consumerOrgId, integrationId) ⇒ <code>Promise.&lt;object&gt;</code>
Get all registration details for a given integration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - List of all webhook/journal registrations  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| integrationId | <code>string</code> | Integration Id from the console |

<a name="EventsCoreAPI+deleteWebhookRegistration"></a>

### eventsCoreAPI.deleteWebhookRegistration(consumerOrgId, integrationId, registrationId) ⇒ <code>Promise.&lt;object&gt;</code>
Delete webhook registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Empty object if deletion was successful  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| integrationId | <code>string</code> | Integration Id from the console |
| registrationId | <code>string</code> | Id of the registration to be deleted |

<a name="EventsCoreAPI+publishEvent"></a>

### eventsCoreAPI.publishEvent(cloudEvent) ⇒ <code>Promise.&lt;string&gt;</code>
Publish Cloud Events

Event publishers can publish events to the Adobe I/O Events using this SDK. The events should follow Cloud Events 1.0 specification: https://github.com/cloudevents/spec/blob/v1.0/spec.md. 
As of now, only application/json is accepted as the content-type for the "data" field of the cloud event.
If retries are set, publish events are retried on network issues, 5xx and 429 error response codes.

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;string&gt;</code> - Returns OK/ undefined in case of success and error in case of failure  

| Param | Type | Description |
| --- | --- | --- |
| cloudEvent | <code>object</code> | Object to be published to event receiver in cloud event format |

<a name="EventsCoreAPI+getEventsFromJournal"></a>

### eventsCoreAPI.getEventsFromJournal(journalUrl, [eventsJournalOptions]) ⇒ <code>Promise.&lt;object&gt;</code>
Get events from a journal.

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - with the response json includes events and links (if available)  

| Param | Type | Description |
| --- | --- | --- |
| journalUrl | <code>string</code> | URL of the journal or 'next' link to read from (required) |
| [eventsJournalOptions] | [<code>EventsJournalOptions</code>](#EventsJournalOptions) | Query options to send with the URL |

<a name="EventsCoreAPI+getEventsObservableFromJournal"></a>

### eventsCoreAPI.getEventsObservableFromJournal(journalUrl, [eventsJournalOptions], [eventsJournalPollingOptions]) ⇒ <code>Observable</code>
getEventsObservableFromJournal returns an RxJS <a href="https://rxjs-dev.firebaseapp.com/guide/observable">Observable</a>

One can go through the extensive documentation on <a href="https://rxjs-dev.firebaseapp.com/guide/overview">RxJS</a> in order to learn more
and leverage the various <a href="https://rxjs-dev.firebaseapp.com/guide/operators">RxJS Operators</a> to act on emitted events.

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Observable</code> - observable to which the user can subscribe to in order to listen to events  

| Param | Type | Description |
| --- | --- | --- |
| journalUrl | <code>string</code> | URL of the journal or 'next' link to read from (required) |
| [eventsJournalOptions] | [<code>EventsJournalOptions</code>](#EventsJournalOptions) | Query options to send with the Journal URL |
| [eventsJournalPollingOptions] | [<code>EventsJournalPollingOptions</code>](#EventsJournalPollingOptions) | Journal polling options |

<a name="EventsCoreAPI+verifySignatureForEvent"></a>

### eventsCoreAPI.verifySignatureForEvent(event, clientSecret, signatureHeaderValue) ⇒ <code>boolean</code>
Authenticating events by verifying signature

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>boolean</code> - If signature matches return true else return false  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>object</code> | JSON payload delivered to the registered webhook URL |
| clientSecret | <code>string</code> | Client secret can be retrieved from the Adobe I/O Console integration |
| signatureHeaderValue | <code>string</code> | Value of x-adobe-signature header in each POST request to the registered webhook URL |

<a name="init"></a>

## init(organizationId, apiKey, accessToken, [httpOptions]) ⇒ [<code>Promise.&lt;EventsCoreAPI&gt;</code>](#EventsCoreAPI)
Returns a Promise that resolves with a new EventsCoreAPI object.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;EventsCoreAPI&gt;</code>](#EventsCoreAPI) - returns object of the class EventsCoreAPI  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | The organization id from your integration |
| apiKey | <code>string</code> | The api key from your integration |
| accessToken | <code>string</code> | JWT Token for the integration with IO Management API scope |
| [httpOptions] | [<code>EventsCoreAPIOptions</code>](#EventsCoreAPIOptions) | Options to configure API calls |

<a name="EventsCoreAPIOptions"></a>

## EventsCoreAPIOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [timeout] | <code>number</code> | Http request timeout in ms (optional) |
| [retries] | <code>number</code> | Number of retries in case of 5xx errors. Default 0 (optional) |

<a name="EventsJournalOptions"></a>

## EventsJournalOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [latest] | <code>boolean</code> | Retrieve latest events (optional) |
| [since] | <code>string</code> | Position at which to start fetching the events from (optional) |
| [limit] | <code>number</code> | Maximum number of events to retrieve (optional) |

<a name="EventsJournalPollingOptions"></a>

## EventsJournalPollingOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [interval] | <code>number</code> | Interval at which to poll the journal; If not provided, a default value will be used (optional) |

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
