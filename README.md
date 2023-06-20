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
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/aio-lib-events.svg)](https://greenkeeper.io/)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-events/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-events/)

# Adobe I/O Events Lib

Node Javascript API wrapping the [Adobe I/O Events API](https://www.adobe.io/apis/experienceplatform/events.html).

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
    // use one of the get methods
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
  setTimeout(() => subscription.unsubscribe(), <timeout in ms>)
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
<dt><a href="#ProviderOptions">ProviderOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ProviderInputModel">ProviderInputModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#EventMetadataInputModel">EventMetadataInputModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#EventsOfInterest">EventsOfInterest</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#RegistrationCreateModel">RegistrationCreateModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#RegistrationUpdateModel">RegistrationUpdateModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Page">Page</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#EventsJournalOptions">EventsJournalOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#EventsJournalPollingOptions">EventsJournalPollingOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SignatureOptions">SignatureOptions</a> : <code>object</code></dt>
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
    * [.getAllProviders(consumerOrgId, fetchEventMetadata, providerOptions)](#EventsCoreAPI+getAllProviders) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getProvider(providerId, [fetchEventMetadata])](#EventsCoreAPI+getProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createProvider(consumerOrgId, projectId, workspaceId, body)](#EventsCoreAPI+createProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.updateProvider(consumerOrgId, projectId, workspaceId, providerId, body)](#EventsCoreAPI+updateProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteProvider(consumerOrgId, projectId, workspaceId, providerId)](#EventsCoreAPI+deleteProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getProviderMetadata()](#EventsCoreAPI+getProviderMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getAllEventMetadataForProvider(providerId)](#EventsCoreAPI+getAllEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getEventMetadataForProvider(providerId, eventCode)](#EventsCoreAPI+getEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createEventMetadataForProvider(consumerOrgId, projectId, workspaceId, providerId, body)](#EventsCoreAPI+createEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.updateEventMetadataForProvider(consumerOrgId, projectId, workspaceId, providerId, eventCode, body)](#EventsCoreAPI+updateEventMetadataForProvider) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteEventMetadata(consumerOrgId, projectId, workspaceId, providerId, eventCode)](#EventsCoreAPI+deleteEventMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteAllEventMetadata(consumerOrgId, projectId, workspaceId, providerId)](#EventsCoreAPI+deleteAllEventMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.createRegistration(consumerOrgId, projectId, workspaceId, body)](#EventsCoreAPI+createRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.updateRegistration(consumerOrgId, projectId, workspaceId, registrationId, body)](#EventsCoreAPI+updateRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getRegistration(consumerOrgId, projectId, workspaceId, registrationId)](#EventsCoreAPI+getRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getAllRegistrationsForWorkspace(consumerOrgId, projectId, workspaceId)](#EventsCoreAPI+getAllRegistrationsForWorkspace) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getAllRegistrationsForOrg(consumerOrgId, [page])](#EventsCoreAPI+getAllRegistrationsForOrg) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.deleteRegistration(consumerOrgId, projectId, workspaceId, registrationId)](#EventsCoreAPI+deleteRegistration) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.publishEvent(cloudEvent)](#EventsCoreAPI+publishEvent) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.getEventsFromJournal(journalUrl, [eventsJournalOptions], [fetchResponseHeaders])](#EventsCoreAPI+getEventsFromJournal) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.getEventsObservableFromJournal(journalUrl, [eventsJournalOptions], [eventsJournalPollingOptions])](#EventsCoreAPI+getEventsObservableFromJournal) ⇒ <code>Observable</code>
    * [.verifyDigitalSignatureForEvent(event, recipientClientId, [signatureOptions])](#EventsCoreAPI+verifyDigitalSignatureForEvent) ⇒ <code>boolean</code>

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

### eventsCoreAPI.getAllProviders(consumerOrgId, fetchEventMetadata, providerOptions) ⇒ <code>Promise.&lt;object&gt;</code>
Fetch all the providers

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns list of providers for the org  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| consumerOrgId | <code>string</code> |  | Consumer Org Id from the console |
| fetchEventMetadata | <code>boolean</code> | <code>false</code> | Option to fetch event metadata for each of the the providers in the list |
| providerOptions | [<code>ProviderOptions</code>](#ProviderOptions) |  | Provider filtering options based on either (providerMetadataId and instanceId) or list of providerMetadataIds |

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
| body | [<code>ProviderInputModel</code>](#ProviderInputModel) | Json data that describes the provider |

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
| body | [<code>ProviderInputModel</code>](#ProviderInputModel) | Json data that describes the provider |

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

<a name="EventsCoreAPI+getProviderMetadata"></a>

### eventsCoreAPI.getProviderMetadata() ⇒ <code>Promise.&lt;object&gt;</code>
**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Returns the list of all entitled provider metadata for the org  
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
| body | [<code>EventMetadataInputModel</code>](#EventMetadataInputModel) | Json data that describes the event metadata |

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
| body | [<code>EventMetadataInputModel</code>](#EventMetadataInputModel) | Json data that describes the event metadata |

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

<a name="EventsCoreAPI+createRegistration"></a>

### eventsCoreAPI.createRegistration(consumerOrgId, projectId, workspaceId, body) ⇒ <code>Promise.&lt;object&gt;</code>
Create a webhook or journal registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the webhook/journal registration created  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| body | [<code>RegistrationCreateModel</code>](#RegistrationCreateModel) | Json data contains details of the registration |

<a name="EventsCoreAPI+updateRegistration"></a>

### eventsCoreAPI.updateRegistration(consumerOrgId, projectId, workspaceId, registrationId, body) ⇒ <code>Promise.&lt;object&gt;</code>
Update a webhook or journal registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the webhook/journal registration to be updated  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| registrationId | <code>string</code> | Registration id whose details are to be fetched |
| body | [<code>RegistrationUpdateModel</code>](#RegistrationUpdateModel) | Json data contains details of the registration |

<a name="EventsCoreAPI+getRegistration"></a>

### eventsCoreAPI.getRegistration(consumerOrgId, projectId, workspaceId, registrationId) ⇒ <code>Promise.&lt;object&gt;</code>
Get registration details for a given registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Details of the webhook/journal registration  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
| registrationId | <code>string</code> | Registration id whose details are to be fetched |

<a name="EventsCoreAPI+getAllRegistrationsForWorkspace"></a>

### eventsCoreAPI.getAllRegistrationsForWorkspace(consumerOrgId, projectId, workspaceId) ⇒ <code>Promise.&lt;object&gt;</code>
Get all registration details for a workspace

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - List of all webhook/journal registrations  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |

<a name="EventsCoreAPI+getAllRegistrationsForOrg"></a>

### eventsCoreAPI.getAllRegistrationsForOrg(consumerOrgId, [page]) ⇒ <code>Promise.&lt;object&gt;</code>
Get all registration details for an org

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Paginated response of all webhook/journal registrations for an org  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| [page] | [<code>Page</code>](#Page) | page size and page number |

<a name="EventsCoreAPI+deleteRegistration"></a>

### eventsCoreAPI.deleteRegistration(consumerOrgId, projectId, workspaceId, registrationId) ⇒ <code>Promise.&lt;object&gt;</code>
Delete webhook registration

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Empty object if deletion was successful  

| Param | Type | Description |
| --- | --- | --- |
| consumerOrgId | <code>string</code> | Consumer Org Id from the console |
| projectId | <code>string</code> | Project Id from the console |
| workspaceId | <code>string</code> | Workspace Id from the console |
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

### eventsCoreAPI.getEventsFromJournal(journalUrl, [eventsJournalOptions], [fetchResponseHeaders]) ⇒ <code>Promise.&lt;object&gt;</code>
Get events from a journal.

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>Promise.&lt;object&gt;</code> - with the response json includes events and links (if available)  

| Param | Type | Description |
| --- | --- | --- |
| journalUrl | <code>string</code> | URL of the journal or 'next' link to read from (required) |
| [eventsJournalOptions] | [<code>EventsJournalOptions</code>](#EventsJournalOptions) | Query options to send with the URL |
| [fetchResponseHeaders] | <code>boolean</code> | Set this to true if you want to fetch the complete response headers |

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

<a name="EventsCoreAPI+verifyDigitalSignatureForEvent"></a>

### eventsCoreAPI.verifyDigitalSignatureForEvent(event, recipientClientId, [signatureOptions]) ⇒ <code>boolean</code>
Authenticating events by verifying digital signature

**Kind**: instance method of [<code>EventsCoreAPI</code>](#EventsCoreAPI)  
**Returns**: <code>boolean</code> - If signature matches return true else return false  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>object</code> | JSON payload delivered to the registered webhook URL |
| recipientClientId | <code>string</code> | Target recipient client id retrieved from the Adobe I/O Console integration |
| [signatureOptions] | [<code>SignatureOptions</code>](#SignatureOptions) | Map of digital signature header fields defined in SignatureOptions |


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
| [eventsBaseURL] | <code>string</code> | Base URL for Events Default https://api.adobe.io (optional) |
| [eventsIngressURL] | <code>string</code> | Ingress URL for Events. Default https://eventsingress.adobe.io (optional) |

<a name="ProviderOptions"></a>

## ProviderOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [providerMetadataId] | <code>string</code> | Fetch by providerMetadataId for the consumer org |
| [instanceId] | <code>string</code> | For Self registered providers, instanceId is a must while fetching by providerMetadataId |
| [providerMetadataIds] | <code>Array</code> | Fetch all providers ( and all instances ) for the list of provider metadata ids |

<a name="ProviderInputModel"></a>

## ProviderInputModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| label | <code>string</code> | The label of this Events Provider |
| [description] | <code>string</code> | The description of this Events Provider |
| [docs_url] | <code>string</code> | The documentation url of this Events Provider |

<a name="EventMetadataInputModel"></a>

## EventMetadataInputModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| label | <code>string</code> | The description of this Event Metadata |
| description | <code>string</code> | The label of this Event Metadata |
| event_code | <code>string</code> | The event_code of this Event Metadata. This event_code describes the type of event. Ideally it should be prefixed with a reverse-DNS name (dictating the organization which defines the semantics of this event type) It is equivalent to the CloudEvents' type. See https://github.com/cloudevents/spec/blob/master/spec.md#type |
| [sample_event_template] | <code>string</code> | An optional base64 encoded sample event template |

<a name="EventsOfInterest"></a>

## EventsOfInterest : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| provider_id | <code>string</code> | The id of the provider of the events to be subscribed |
| event_code | <code>string</code> | The requested valid event code belonging to the provider |

<a name="RegistrationCreateModel"></a>

## RegistrationCreateModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| client_id | <code>string</code> | Client id for which the registration is created |
| name | <code>string</code> | The name of the registration |
| description | <code>string</code> | The description of the registration |
| [webhook_url] | <code>string</code> | A valid webhook url where the events would be delivered for webhook or webhook_batch delivery_type |
| events_of_interest | [<code>Array.&lt;EventsOfInterest&gt;</code>](#EventsOfInterest) | The events for which the registration is to be subscribed to |
| delivery_type | <code>string</code> | Delivery type can either be webhook, webhook_batch or journal. |
| [enabled] | <code>string</code> | Enable or disable the registration. Default true. |

<a name="RegistrationUpdateModel"></a>

## RegistrationUpdateModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the registration |
| description | <code>string</code> | The description of the registration |
| [webhook_url] | <code>string</code> | A valid webhook url where the events would be delivered for webhook or webhook_batch delivery_type |
| events_of_interest | [<code>Array.&lt;EventsOfInterest&gt;</code>](#EventsOfInterest) | The events for which the registration is to be subscribed to |
| delivery_type | <code>string</code> | Delivery type can either be webhook, webhook_batch or journal. |
| [enabled] | <code>string</code> | Enable or disable the registration. Default true. |

<a name="Page"></a>

## Page : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [page] | <code>number</code> | page number to be fetched. Default 0 (optional) |
| [size] | <code>number</code> | size of each page. Default 10 (optional) |

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

<a name="SignatureOptions"></a>

## SignatureOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [digiSignature1] | <code>string</code> | Value of digital signature retrieved from the x-adobe-digital-signature1 header |
| [digiSignature2] | <code>string</code> | Value of digital signature retrieved from the x-adobe-digital-signature2 header |
| [publicKeyPath1] | <code>string</code> | Relative path of ioevents public key retrieved from the x-adobe-public-key1-path header |
| [publicKeyPath2] | <code>string</code> | Relative path of ioevents public key retrieved from the x-adobe-public-key2-path header |

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
