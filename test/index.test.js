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

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkErrorResponse"] }] */

const mockStateInstance = {
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn()
}
jest.mock('@adobe/aio-lib-state', () => ({
  init: jest.fn().mockResolvedValue(mockStateInstance)
}))

const sdk = require('../src')
const mock = require('./mock')
const errorSDK = require('../src/SDKErrors')
const fetch = require('node-fetch')
const { Response } = jest.requireActual('node-fetch')
const fetchRetry = require('@adobe/aio-lib-core-networking')
const Rx = require('rxjs')

// /////////////////////////////////////////////

const gOrganizationId = 'test-org'
const gApiKey = 'test-apikey'
const gAccessToken = 'test-token'
const journalUrl = 'http://journal-url/events/organizations/orgId/integrations/integId/regId'
const EVENTS_BASE_URL = 'fakebaseurl'
const EVENTS_INGRESS_URL = 'fakeingressurl'

// /////////////////////////////////////////////

const createSdkClient = async () => {
  return sdk.init(gOrganizationId, gApiKey, gAccessToken)
}

// /////////////////////////////////////////////

beforeEach(() => {
  jest.clearAllMocks()
})

// /////////////////////////////////////////////

describe('SDK init test', () => {
  it('sdk init test', async () => {
    const options = {
      eventsBaseURL: EVENTS_BASE_URL,
      eventsIngressURL: EVENTS_INGRESS_URL
    }
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, options)
    expect(sdkClient.organizationId).toBe(gOrganizationId)
    expect(sdkClient.apiKey).toBe(gApiKey)
    expect(sdkClient.accessToken).toBe(gAccessToken)
    expect(sdkClient.httpOptions.eventsBaseURL).toBe(EVENTS_BASE_URL)
    expect(sdkClient.httpOptions.eventsIngressURL).toBe(EVENTS_INGRESS_URL)
  })
  it('sdk init test with URL options', async () => {
    const sdkClient = await createSdkClient()
    expect(sdkClient.organizationId).toBe(gOrganizationId)
    expect(sdkClient.apiKey).toBe(gApiKey)
    expect(sdkClient.accessToken).toBe(gAccessToken)
  })
  it('sdk init test - no imsOrgId', async () => {
    return expect(sdk.init(null, gApiKey, gAccessToken)).rejects.toEqual(
      new errorSDK.codes.ERROR_SDK_INITIALIZATION({ messageValues: 'organizationId' })
    )
  })
  it('sdk init test - no apiKey', async () => {
    return expect(sdk.init(gOrganizationId, null, gAccessToken)).rejects.toEqual(
      new errorSDK.codes.ERROR_SDK_INITIALIZATION({ messageValues: 'apiKey' })
    )
  })
  test('sdk init test - no accessToken', async () => {
    return expect(sdk.init(gOrganizationId, gApiKey, null)).rejects.toEqual(
      new errorSDK.codes.ERROR_SDK_INITIALIZATION({ messageValues: 'accessToken' })
    )
  })
})

describe('Set headers', () => {
  it('test set headers', async () => {
    const sdkClient = await createSdkClient()
    const response = await sdkClient.__setHeaders({}, sdkClient)
    expect(response.Authorization).toBe('Bearer test-token')
    expect(response['Content-Type']).toBe('application/json')
    expect(response['x-api-key']).toBe('test-apikey')
  })
  it('test preset headers', async () => {
    const sdkClient = await createSdkClient()
    const headers = {}
    headers['x-api-key'] = 'api-key'
    headers['x-ims-org-id'] = 'org-id'
    headers['Content-Type'] = 'text/plain'
    headers.Authorization = 'Bearer token'
    const response = await sdkClient.__setHeaders(headers, sdkClient)
    expect(response.Authorization).toBe('Bearer token')
    expect(response['Content-Type']).toBe('text/plain')
    expect(response['x-api-key']).toBe('api-key')
  })
})

describe('test get all providers', () => {
  it('Success on get all providers', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.getAllProvidersResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllProviders('consumerOrgId')
    expect(res._embedded.providers.length).toBe(2)
    expect(res._embedded.providers[0].id).toBe('test-id-1')
    expect(res._embedded.providers[1].id).toBe('test-id-2')
  })
  it('Not found error on get all providers ', async () => {
    const api = 'getAllProviders'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_PROVIDERS(), ['consumerOrgId1'])
  })
})

describe('test get provider', () => {
  it('Success on get provider by id', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.providerResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getProvider('test-id')
    expect(res.id).toBe('test-id')
    expect(res.source).toBe('urn:uuid:test-id')
  })
  it('Not found error on get provider by id ', async () => {
    const api = 'getProvider'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_PROVIDER(), ['test-id-1'])
  })
})

describe('test get provider with eventmetadata', () => {
  it('Success on get provider by id', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.providerWithEventMetadataResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getProvider('test-id', true)
    expect(res.id).toBe('test-id')
    expect(res.source).toBe('urn:uuid:test-id')
    expect(res._embedded.eventmetadata[0].event_code).toBe('com.adobe.events.sdk.event.test')
  })
  it('Not found error on get provider by id ', async () => {
    const api = 'getProvider'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_PROVIDER(), ['test-id-1', true])
  })
})

describe('test create new provider', () => {
  it('Success on creating new provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.providerResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.createProvider('consumerOrgId', 'projectId',
      'workspaceId', mock.data.createProvider)
    expect(res.id).toBe('test-id')
  })
  it('Bad request error on creating new provider', async () => {
    const api = 'createProvider'
    mockExponentialBackoff({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_CREATE_PROVIDER(),
      ['consumerOrgId', 'projectId', 'workspaceId', mock.data.createProviderBadRequest])
  })
})

describe('test update provider', () => {
  it('Success on update provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.updateProviderResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.updateProvider('consumerOrgId', 'projectId',
      'workspaceId', 'test-id', mock.data.updateProvider)
    expect(res.id).toBe('test-id')
    expect(res.label).toBe('Test provider 2')
  })
  it('Bad request error on update provider', async () => {
    const api = 'updateProvider'
    mockExponentialBackoff({}, { status: 400, statusText: 'Bad Request' })
    checkErrorResponse(api, new errorSDK.codes.ERROR_UPDATE_PROVIDER(),
      ['consumerOrgId', 'projectId', 'workspaceId', 'test-id',
        mock.data.updateProviderBadRequest])
  })
})

describe('test delete provider', () => {
  it('Success on delete provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteProvider('consumerOrgId', 'projectId',
      'workspaceId', 'test-id')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete provider', () => {
    const api = 'deleteProvider'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api, new errorSDK.codes.ERROR_DELETE_PROVIDER(),
      ['consumerOrgId', 'projectId', 'workspaceId', 'test-id1'])
  })
})

// /////////////////////////////////////////////

describe('Get all event metadata for provider', () => {
  it('Success on get all event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.getAllEventMetadataResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllEventMetadataForProvider('test-id')
    expect(res._embedded.eventmetadata[0].event_code).toBe('com.adobe.event_code_1')
    expect(res._embedded.eventmetadata[1].event_code).toBe('com.adobe.event_code_2')
  })
  it('Bad Request error on get all event metadata for provider', async () => {
    const api = 'getAllEventMetadataForProvider'
    mockExponentialBackoff({}, { status: 400, statusText: 'Bad Request' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_GET_ALL_EVENTMETADATA(),
      ['test-id-1'])
  })
})

describe('Get event metadata for provider', () => {
  it('Success on get event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.getEventMetadataResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.getEventMetadataForProvider(
      'test-id', 'event_code_1')
    expect(res.event_code).toBe('com.adobe.event_code_1')
  })
  it('Not found error on get event metadata for provider', async () => {
    const api = 'getEventMetadataForProvider'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_GET_EVENTMETADATA(),
      ['test-id', 'event_code_3'])
  })
})

describe('Create event metadata for provider', () => {
  it('Success on create event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.createEventMetadataForProviderResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.createEventMetadataForProvider('consumerOrgId',
      'projectId', 'workspaceId', 'test-id',
      mock.data.createEventMetadataForProvider)
    expect(res.event_code).toBe('com.adobe.event_code_1')
    expect(res.label).toBe('test event code 1')
    expect(res.description).toBe('Test for SDK 1')
  })
  it('Bad request error on create event metadata for provider', async () => {
    const api = 'createEventMetadataForProvider'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_CREATE_EVENTMETADATA(),
      ['consumerOrgId', 'projectId', 'workspaceId', 'test-id',
        mock.data.createEventMetadataBadRequest])
  })
})

describe('Update event metadata for provider', () => {
  it('Success on update event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.createEventMetadataForProviderResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.updateEventMetadataForProvider('consumerOrgId',
      'projectId', 'workspaceId', 'test-id', 'event_code_1',
      mock.data.createEventMetadataForProvider)
    expect(res.event_code).toBe('com.adobe.event_code_1')
    expect(res.label).toBe('test event code 1')
    expect(res.description).toBe('Test for SDK 1')
  })
  it('Bad request error on update event metadata for provider', async () => {
    const api = 'updateEventMetadataForProvider'
    mockExponentialBackoff({}, { status: 400, statusText: 'Bad Request' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_UPDATE_EVENTMETADATA(),
      ['consumerOrgId', 'projectId', 'workspaceId', 'test-id', 'event_code_1',
        mock.data.createEventMetadataBadRequest])
  })
})

describe('Delete eventmetadata', () => {
  it('Success on delete eventmetadata', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteEventMetadata('consumerOrgId', 'projectId',
      'workspaceId', 'test-id', 'event_code_1')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete eventmetadata', async () => {
    const api = 'deleteEventMetadata'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_DELETE_EVENTMETADATA(),
      ['consumerOrgId', 'projectId', 'workspaceId', 'test-id', 'event_code_2'])
  })
})

describe('Delete all eventmetadata', () => {
  it('Success on delete all eventmetadata', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteAllEventMetadata('consumerOrgId', 'projectId',
      'workspaceId', 'test-id')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete all eventmetadata', async () => {
    const api = 'deleteAllEventMetadata'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_DELETE_ALL_EVENTMETADATA(),
      ['consumerOrgId', 'projectId', 'workspaceId', 'test-id'])
  })
})

describe('Create webhook registration', () => {
  it('Success on create webhook registration', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.createWebhookRegistrationResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.createWebhookRegistration('consumerOrgId', 'integrationId', mock.data.createWebhookRegistration)
    expect(res.id).toBe(248723)
    expect(res.status).toBe('VERIFIED')
  })
  it('Bad request error on create webhook registration', async () => {
    const api = 'createWebhookRegistration'
    mockExponentialBackoff({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_CREATE_REGISTRATION(), ['consumerOrgId', 'integrationId', mock.data.createWebhookRegistrationBadRequest])
  })
})

describe('Get all webhook registration', () => {
  it('Success on get all webhook registration', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.getAllWebhookRegistrationsResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllWebhookRegistrations('consumerOrgId', 'integrationId')
    expect(res.length).toBe(2)
    expect(res[0].id).toBe(1)
    expect(res[1].status).toBe('VERIFIED')
  })
  it('Not found error on get all webhook registration', async () => {
    const api = 'getAllWebhookRegistrations'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_REGISTRATION(), ['consumerOrgId', 'integrationId-1'])
  })
})

describe('Get a webhook registration', () => {
  it('Success on get a webhook registration', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.createWebhookRegistrationResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getWebhookRegistration('consumerOrgId', 'integrationId', 'registration-id')
    expect(res.id).toBe(248723)
    expect(res.status).toBe('VERIFIED')
  })
  it('Not found error on get a webhook registration', async () => {
    const api = 'getWebhookRegistration'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_REGISTRATION(), ['consumerOrgId', 'integrationId', 'registration-id-1'])
  })
})

describe('Get webhook registration with retries', () => {
  it('Test for retries on 5xx response', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, { retries: 3 })
    const error = new errorSDK.codes.ERROR_GET_REGISTRATION()
    mockExponentialBackoff({}, { status: 500, statusText: 'Internal Server Error', url: journalUrl })
    await sdkClient.getWebhookRegistration('consumerOrgId', 'integrationId', 'registration-id')
      .then(res => {
        throw new Error(' No error response')
      })
      .catch(e => {
        expect(e.name).toEqual(error.name)
        expect(e.code).toEqual(error.code)
      })
    expect(fetchRetry.exponentialBackoff).toHaveBeenCalledWith(
      'https://api.adobe.io/events/organizations/consumerOrgId/integrations/integrationId/registrations/registration-id',
      {
        body: undefined,
        headers: {
          Authorization: '***',
          'Content-Type': 'application/json',
          'x-api-key': '***',
          'x-ims-org-id': 'test-org'
        },
        method: 'GET',
        timeout: undefined
      }, { maxRetries: 3, initialDelayInMillis: 1000 })
  })
})

describe('test delete webhook registration', () => {
  it('Success on delete registration', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteWebhookRegistration('consumerOrgId', 'integrationId',
      'registrationId')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete registration', () => {
    const api = 'deleteWebhookRegistration'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api, new errorSDK.codes.ERROR_DELETE_REGISTRATION(),
      ['consumerOrgId', 'integrationId', 'registrationId1'])
  })
})

describe('Publish event', () => {
  it('200 OK on publish event', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff('OK', { status: 200, statusText: 'OK' })
    const res1 = await sdkClient.publishEvent(mock.data.cloudEvent)
    expect(res1).toBe('"OK"')
  })
  it('204 No Content on publish event', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff('No Content', { status: 204, statusText: 'No Content' })
    const res2 = await sdkClient.publishEvent(mock.data.cloudEvent)
    expect(res2).toBe(undefined)
  })
  it('Bad request error on publish event', async () => {
    const api = 'publishEvent'
    mockExponentialBackoff({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_PUBLISH_EVENT(), [mock.data.cloudEventEmptyPayload])
  })
})

describe('Publish event with retries', () => {
  it('Test for retries on 5xx response', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, { retries: 3 })
    const retryOnSpy = jest.spyOn(sdkClient, '__getRetryOn')
    const error = new errorSDK.codes.ERROR_PUBLISH_EVENT()
    mockExponentialBackoff({}, { status: 500, statusText: 'Internal Server Error', url: 'https://eventsingress.adobe.io' })
    await sdkClient.publishEvent(mock.data.cloudEventEmptyPayload)
      .then(res => {
        throw new Error(' No error response')
      })
      .catch(e => {
        expect(e.name).toEqual(error.name)
        expect(e.code).toEqual(error.code)
      })
    expect(retryOnSpy).toHaveBeenCalledWith(3)
    retryOnSpy.mockRestore()
  })
})

describe('Test retry on', () => {
  it('Retry on returns true on 3 max retries, error 429, attempt 0', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken)
    const retryOnFn = sdkClient.__getRetryOn(3)
    const result1 = retryOnFn(0, null, { status: 429 })
    expect(result1).toBe(true)
  })
  it('Retry on returns true on 3 max retries, error 500, attempt 1', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken)
    const retryOnFn = sdkClient.__getRetryOn(3)
    const result2 = retryOnFn(1, null, { status: 500 })
    expect(result2).toBe(true)
  })
  it('Retry on returns true on 3 max retries, network error, attempt 2', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken)
    const retryOnFn = sdkClient.__getRetryOn(3)
    const result3 = retryOnFn(2, new Error(), undefined)
    expect(result3).toBe(true)
  })
  it('Retry on returns false on 3 max retries, network error, attempt 4', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken)
    const retryOnFn = sdkClient.__getRetryOn(3)
    const result4 = retryOnFn(4, new Error(), undefined)
    expect(result4).toBe(false)
  })
  it('Retry on returns false on 3 max retries, error 429, attempt 3', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken)
    const retryOnFn = sdkClient.__getRetryOn(3)
    const result5 = retryOnFn(3, null, { status: 429 })
    expect(result5).toBe(false)
  })
  it('Retry on returns false on 3 max retries, 200 OK, attempt 0', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken)
    const retryOnFn = sdkClient.__getRetryOn(3)
    const result6 = retryOnFn(0, null, { status: 200 })
    expect(result6).toBe(false)
  })
})

describe('Fetch from journalling', () => {
  it('200 response on fetch from journal', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.journalResponseBody, mock.data.journalResponseHeader200)
    const res1 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res1.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res1.events[0].position).toBe('position-2')
    expect(res1.responseHeaders).toBeUndefined()
  })
  it('204 response on fetch from journal with retry after as number', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(undefined, mock.data.journalResponseHeader204)
    const res2 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res2.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res2.retryAfter).toBe(10000)
  })
  it('204 response on fetch from journal with retry after as date time string', async () => {
    const sdkClient = await createSdkClient()
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 0)
    global.Date.now = dateNowStub
    mockExponentialBackoff(undefined, mock.data.journalResponseHeader204DateTime)
    const res3 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res3.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res3.retryAfter).toBe(10000)
    global.Date.now = realDateNow
  })
  it('204 response on fetch from journal with missing links header', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(undefined, mock.data.journalResponseHeader204MissingLinks)
    const res4 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res4.link).toBe(undefined)
    expect(res4.retryAfter).toBe(10000)
  })
  it('429 response on fetch from journal', async () => {
    const api = 'getEventsFromJournal'
    mockExponentialBackoff({}, { status: 429, statusText: 'Too Many Requests' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_JOURNAL_DATA(), [journalUrl])
  })
  it('Not found error on fetch from journal', async () => {
    const api = 'getEventsFromJournal'
    mockExponentialBackoff({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_JOURNAL_DATA(), [journalUrl])
  })
  it('Fetch from journal with retries', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, { retries: 3 })
    const retryOnSpy = jest.spyOn(sdkClient, '__getRetryOn')
    const error = new errorSDK.codes.ERROR_GET_JOURNAL_DATA()
    mockExponentialBackoff({}, { status: 500, statusText: 'Internal Server Error', url: journalUrl })
    await sdkClient.getEventsFromJournal(journalUrl)
      .then(res => {
        throw new Error(' No error response')
      })
      .catch(e => {
        expect(e.name).toEqual(error.name)
        expect(e.code).toEqual(error.code)
      })
    expect(retryOnSpy).toHaveBeenCalledWith(3)
    retryOnSpy.mockRestore()
  })
  it('200 response on fetch from journal with response headers', async () => {
    const sdkClient = await createSdkClient()
    mockExponentialBackoff(mock.data.journalResponseBody, mock.data.journalResponseHeader200)
    const res = await sdkClient.getEventsFromJournal(journalUrl, {}, true)
    expect(res.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res.events[0].position).toBe('position-2')
    expect(res.responseHeaders).toBeDefined()
  })
})

describe('Get events observable from journal', () => {
  it('Observable returned on get journal observable', async () => {
    const sdkClient = await createSdkClient()
    const res = sdkClient.getEventsObservableFromJournal(journalUrl, { limit: 2 }, { interval: 2000 })
    expect(res instanceof Rx.Observable).toBe(true)
  })
})

describe('Authenticate event with digital signatures', () => {
  const event = mock.data.testEvent.event
  const signatureOptions = mock.data.signatureOptions.params
  const recipientClientId = mock.data.testClientId.recipientClientId

  it('Verify event signature successfully', async () => {
    const validTestPubKey = mock.data.testPubKeys.validTestPubKey
    fetch.mockImplementation(() => {
      return Promise.resolve(new Response(Buffer.from(validTestPubKey, 'base64').toString('utf-8')))
    })
    const sdkClient = await createSdkClient()
    const verified = await sdkClient.verifyDigitalSignatureForEvent(event, recipientClientId, signatureOptions)
    expect(verified).toBe(true)
  })
  it('Verify event signature with error', async () => {
    const invalidTestPubKey = mock.data.testPubKeys.invalidTestPubKey
    fetch.mockImplementation(() => {
      return Promise.resolve(new Response(Buffer.from(invalidTestPubKey, 'base64').toString('utf-8')))
    })
    const sdkClient = await createSdkClient()
    const verified = await sdkClient.verifyDigitalSignatureForEvent(event, recipientClientId, signatureOptions)
    expect(verified).toBe(false)
  })
  it('Verify invalid target recipient', async () => {
    const eventPayload = mock.data.testEvent.event
    const sdkClient = await createSdkClient()
    const response = await sdkClient.verifyDigitalSignatureForEvent(eventPayload, 'testInvalidClient')
    expect(response.error.statusCode).toBe(401)
  })
})

/**
 * Mock for exponential backoff module used for fetch with retries
 *
 * @param {object} mockResponse Mock response expected
 * @param {object} mockHeader Mock headers expected
 * @private
 */
function mockExponentialBackoff (mockResponse, mockHeader) {
  fetchRetry.exponentialBackoff = jest.fn().mockReturnValue(
    new Promise((resolve) => {
      if (mockResponse !== undefined) { mockResponse = JSON.stringify(mockResponse) }
      const resp = new Response(mockResponse, mockHeader)
      resolve(resp)
    }))
}

/**
 * Check error response matches expected name and code
 *
 * @param {string} fn Function under test
 * @param {object} error Expected error
 * @param {Array} args Arguments to be passed to the function under test
 * @private
 */
async function checkErrorResponse (fn, error, args = []) {
  const client = await createSdkClient()
  return new Promise((resolve, reject) => {
    (client[fn].apply(client, args))
      .then(res => {
        reject(new Error(' No error response'))
      })
      .catch(e => {
        expect(e.name).toEqual(error.name)
        expect(e.code).toEqual(error.code)
        resolve()
      })
  })
}
