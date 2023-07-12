/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const sdk = require('../src/index')
const path = require('path')

const loggerNamespace = '@adobe/aio-lib-events'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace,
  { level: process.env.LOG_LEVEL })
const ZonedDateTime = require('@js-joda/core').ZonedDateTime
const ZoneOffset = require('@js-joda/core').ZoneOffset

jest.setTimeout(60000)

// load .env values in the e2e folder, if any
require('dotenv').config({ path: path.join(__dirname, '.env') })

let sdkClient = {}
let providerId = {}
let provider = {}
let eventCode = {}
let eventMetadata = {}
let journalReg = {}
let journalling = {}
const orgId = process.env.EVENTS_ORG_ID
const apiKey = process.env.EVENTS_API_KEY
const accessToken = process.env.EVENTS_JWT_TOKEN
const consumerOrgId = process.env.EVENTS_CONSUMER_ORG_ID
const workspaceId = process.env.EVENTS_WORKSPACE_ID
const projectId = process.env.EVENTS_PROJECT_ID
const httpOptions = { retries: 3 }
const randomNumber = Math.round(Math.random() * 100000)

beforeAll(async () => {
  sdkClient = await sdk.init(orgId, apiKey, accessToken, httpOptions)
  jest.setTimeout(240000)
  jest.useRealTimers()
})

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

test('test create provider', async () => {
  // create a provider
  provider = await sdkClient.createProvider(consumerOrgId, projectId,
    workspaceId,
    {
      label: 'EventsSDKE2E ' + randomNumber,
      organization_id: orgId
    })
  expect(provider.label).toBe('EventsSDKE2E ' + randomNumber)
  providerId = provider.id
  logger.info('Provider id: ' + providerId)
})

test('test create event metadata', async () => {
  // create event metadata
  eventCode = 'com.adobe.events.sdk.event.' + randomNumber
  eventMetadata = await sdkClient.createEventMetadataForProvider(consumerOrgId,
    projectId,
    workspaceId, providerId, {
      event_code: eventCode,
      description: 'E2E test for Events SDK',
      label: 'EventsSDKE2E ' + randomNumber
    })
  expect(eventMetadata.event_code).toBe(eventCode)
  logger.info('Event code: ' + eventCode)
})

test('test register journalling endpoint', async () => {
  // create journal registration
  journalReg = await sdkClient.createRegistration(consumerOrgId, projectId, workspaceId, {
    name: 'Test Events SDK ' + randomNumber,
    description: 'Test Events SDK ' + randomNumber,
    client_id: apiKey,
    delivery_type: 'journal',
    events_of_interest: [
      {
        event_code: eventCode,
        provider_id: providerId
      }
    ]
  })
  expect(journalReg.webhook_status).toBe('verified')
  expect(journalReg.enabled).toBe(true)
})

test('test fetch journalling position', async () => {
  const journallingUrl = journalReg._links['rel:events'].href
  logger.info('Journal endpoint ' + journallingUrl + ' has been registered')

  // sleep for one min
  await sleep(60000)

  // fetch position for next event for journalling
  journalling = await sdkClient.getEventsFromJournal(journallingUrl,
    { latest: true })
  expect(journalling).toBeTruthy()
  expect(journalling.link.next).toBeTruthy()
  expect(journalling.retryAfter).toBe(10000)
})

test('test publish event', async () => {
  // fire event
  const publish = await sdkClient.publishEvent({
    id: 'test-' + randomNumber,
    source: 'urn:uuid:' + providerId,
    time: ZonedDateTime.now(ZoneOffset.UTC).toString(),
    type: eventCode,
    data: {
      test: 'eventsSDKe2e_' + randomNumber
    }
  })
  expect(publish).toBe('OK')
})

test('test event received in journalling endpoint', async () => {
  let count = 0
  let nextLink = journalling.link.next
  // retry to fetch from journalling 3 times ( 30 seconds )
  while (count < 3 && journalling.retryAfter && journalling.events === undefined) {
    journalling = await sdkClient.getEventsFromJournal(nextLink, { latest: true })
    nextLink = journalling.link.next
    if (journalling.retryAfter) {
      await sleep(journalling.retryAfter)
    }
    count = count + 1
  }
  // test the event we fetched from journalling
  expect(journalling.events[0].event.source).toBe('urn:uuid:' + providerId)
  expect(journalling.events[0].event.id).toBe('test-' + randomNumber)
})

test('delete webhook registration', async () => {
  await expect(sdkClient.deleteRegistration(consumerOrgId, projectId, workspaceId, journalReg.registration_id))
    .resolves.not.toThrow()
  journalReg = undefined
})

test('delete event metadata', async () => {
  await expect(sdkClient.deleteAllEventMetadata(consumerOrgId, projectId,
    workspaceId, providerId))
    .resolves.not.toThrow()
  eventMetadata = undefined
})

test('delete provider', async () => {
  await expect(sdkClient.deleteProvider(consumerOrgId, projectId, workspaceId,
    providerId))
    .resolves.not.toThrow()
  provider = undefined
})

afterAll(async () => {
  // delete webhook registration
  if (journalReg) {
    await sdkClient.deleteRegistration(consumerOrgId, projectId, workspaceId,
      journalReg.registration_id)
  }

  // delete event metadata
  if (eventMetadata) {
    await sdkClient.deleteAllEventMetadata(consumerOrgId, projectId,
      workspaceId, providerId)
  }

  // delete provider
  if (provider) {
    await sdkClient.deleteProvider(consumerOrgId, projectId, workspaceId,
      providerId)
  }
})
