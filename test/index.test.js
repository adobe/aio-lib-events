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

const mockExponentialBackoff = jest.fn()
const mockHttpExponentialBackoff = jest.fn(() => ({
  exponentialBackoff: mockExponentialBackoff
}))

jest.mock('@adobe/aio-lib-core-networking', () => {
  const originalModule = jest.requireActual('@adobe/aio-lib-core-networking')
  return {
    ...originalModule,
    HttpExponentialBackoff: mockHttpExponentialBackoff
  }
})

const sdk = require('../src')
const mock = require('./mock')
const errorSDK = require('../src/SDKErrors')
const fetch = require('node-fetch')
const { Response } = jest.requireActual('node-fetch')
const { HttpExponentialBackoff } = require('@adobe/aio-lib-core-networking')
const fetchRetry = new HttpExponentialBackoff()
const Rx = require('rxjs')

// /////////////////////////////////////////////

const gOrganizationId = 'test-org'
const gApiKey = 'test-apikey'
const gAccessToken = 'test-token'
const journalUrl = 'http://journal-url/events/organizations/orgId/integrations/integId/regId'
const EVENTS_BASE_URL = 'https://api.adobe.io/events'
const EVENTS_INGRESS_URL = 'https://eventsingress.adobe.io'
const CONFLICTING_ID = 'conflictingId'

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
    exponentialBackoffMockReturnValue(mock.data.getAllProvidersResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllProviders('consumerId')
    expect(res._embedded.providers.length).toBe(2)
    expect(res._embedded.providers[0].id).toBe('test-id-1')
    expect(res._embedded.providers[1].id).toBe('test-id-2')
  })
  it('Success on get all providers for provider metadata ids list', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getAllProvidersResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllProviders('consumerId',
      {
        fetchEventMetadata: false,
        filterBy: { providerMetadataIds: ['pm-1', 'pm-2'] }
      })
    expect(res._embedded.providers.length).toBe(2)
    expect(res._embedded.providers[0].provider_metadata).toBe('pm-1')
    expect(res._embedded.providers[1].provider_metadata).toBe('pm-2')
  })
  it('Success on get all providers for a provider metadata id and instance id', async () => {
    const sdkClient = await createSdkClient()
    const returnedValue = mock.data.getAllProvidersResponse
    returnedValue._embedded.providers.pop()
    exponentialBackoffMockReturnValue(returnedValue, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllProviders('consumerId',
      {
        fetchEventMetadata: false,
        filterBy: { providerMetadataId: 'pm-1', instanceId: 'instance-1' }
      })
    expect(res._embedded.providers.length).toBe(1)
    expect(res._embedded.providers[0].id).toBe('test-id-1')
    expect(res._embedded.providers[0].provider_metadata).toBe('pm-1')
    expect(res._embedded.providers[0].instance_id).toBe('instance-1')
  })
  it('Success on get all providers with eventmetadata', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getAllProvidersWithEventMetadataResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllProviders('consumerId', { fetchEventMetadata: true })
    expect(res._embedded.providers.length).toBe(1)
    expect(res._embedded.providers[0].id).toBe('test-id-1')
    expect(res._embedded.providers[0]._embedded.eventmetadata[0].event_code).toBe('com.adobe.events.sdk.event.test')
  })
  it('Error on get all providers with providerMetadataIds list and providerMetadatataId query params', async () => {
    const api = 'getAllProviders'
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_PROVIDERS(), ['consumerId',
      {
        fetchEventMetadata: false,
        filterBy: {
          providerMetadataIds: ['pm1', 'pm2'],
          providerMetadataId: 'pm1'
        }
      }
    ])
  })
  it('Not found error on get all providers ', async () => {
    const api = 'getAllProviders'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_PROVIDERS(), ['consumerId1'])
  })
})

describe('test get provider', () => {
  it('Success on get provider by id', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.providerResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getProvider('test-id')
    expect(res.id).toBe('test-id')
    expect(res.source).toBe('urn:uuid:test-id')
  })
  it('Not found error on get provider by id ', async () => {
    const api = 'getProvider'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_PROVIDER(), ['test-id-1'])
  })
})

describe('test get provider with eventmetadata', () => {
  it('Success on get provider by id', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.providerWithEventMetadataResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getProvider('test-id', true)
    expect(res.id).toBe('test-id')
    expect(res.source).toBe('urn:uuid:test-id')
    expect(res._embedded.eventmetadata[0].event_code).toBe('com.adobe.events.sdk.event.test')
  })
  it('Not found error on get provider by id ', async () => {
    const api = 'getProvider'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_PROVIDER(), ['test-id-1', true])
  })
})

describe('test create new provider', () => {
  it('Success on creating new provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.providerResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.createProvider('consumerId', 'projectId',
      'workspaceId', mock.data.createProvider)
    expect(res.id).toBe('test-id')
  })
  it('Bad request error on creating new provider', async () => {
    const api = 'createProvider'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_CREATE_PROVIDER(),
      ['consumerId', 'projectId', 'workspaceId', mock.data.createProviderBadRequest])
  })
})

describe('test update provider', () => {
  it('Success on update provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.updateProviderResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.updateProvider('consumerId', 'projectId',
      'workspaceId', 'test-id', mock.data.updateProvider)
    expect(res.id).toBe('test-id')
    expect(res.label).toBe('Test provider 2')
  })
  it('Bad request error on update provider', async () => {
    const api = 'updateProvider'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    checkErrorResponse(api, new errorSDK.codes.ERROR_UPDATE_PROVIDER(),
      ['consumerId', 'projectId', 'workspaceId', 'test-id',
        mock.data.updateProviderBadRequest])
  })
})

describe('test delete provider', () => {
  it('Success on delete provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteProvider('consumerId', 'projectId',
      'workspaceId', 'test-id')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete provider', () => {
    const api = 'deleteProvider'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api, new errorSDK.codes.ERROR_DELETE_PROVIDER(),
      ['consumerId', 'projectId', 'workspaceId', 'test-id1'])
  })
})

// ////////////////////////////////////////////

describe('test get provider metadata', () => {
  it('Success on get provider metadata for org', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getProviderMetadataForOrg, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getProviderMetadata()
    expect(res._embedded.providermetadata.length).toBe(2)
  })
  it('Not found error on get provider metadata', async () => {
    const api = 'getProviderMetadata'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_PROVIDER_METADATA())
  })
})

// /////////////////////////////////////////////

describe('Get all event metadata for provider', () => {
  it('Success on get all event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getAllEventMetadataResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllEventMetadataForProvider('test-id')
    expect(res._embedded.eventmetadata[0].event_code).toBe('com.adobe.event_code_1')
    expect(res._embedded.eventmetadata[1].event_code).toBe('com.adobe.event_code_2')
  })
  it('Bad Request error on get all event metadata for provider', async () => {
    const api = 'getAllEventMetadataForProvider'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_GET_ALL_EVENTMETADATA(),
      ['test-id-1'])
  })
})

describe('Get event metadata for provider', () => {
  it('Success on get event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getEventMetadataResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.getEventMetadataForProvider(
      'test-id', 'event_code_1')
    expect(res.event_code).toBe('com.adobe.event_code_1')
  })
  it('Not found error on get event metadata for provider', async () => {
    const api = 'getEventMetadataForProvider'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_GET_EVENTMETADATA(),
      ['test-id', 'event_code_3'])
  })
})

describe('Create event metadata for provider', () => {
  it('Success on create event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.createEventMetadataForProviderResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.createEventMetadataForProvider('consumerId',
      'projectId', 'workspaceId', 'test-id',
      mock.data.createEventMetadataForProvider)
    expect(res.event_code).toBe('com.adobe.event_code_1')
    expect(res.label).toBe('test event code 1')
    expect(res.description).toBe('Test for SDK 1')
  })
  it('Bad request error on create event metadata for provider', async () => {
    const api = 'createEventMetadataForProvider'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_CREATE_EVENTMETADATA(),
      ['consumerId', 'projectId', 'workspaceId', 'test-id',
        mock.data.createEventMetadataBadRequest])
  })
})

describe('Update event metadata for provider', () => {
  it('Success on update event metadata for provider', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.createEventMetadataForProviderResponse,
      { status: 200, statusText: 'OK' })
    const res = await sdkClient.updateEventMetadataForProvider('consumerId',
      'projectId', 'workspaceId', 'test-id', 'event_code_1',
      mock.data.createEventMetadataForProvider)
    expect(res.event_code).toBe('com.adobe.event_code_1')
    expect(res.label).toBe('test event code 1')
    expect(res.description).toBe('Test for SDK 1')
  })
  it('Bad request error on update event metadata for provider', async () => {
    const api = 'updateEventMetadataForProvider'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_UPDATE_EVENTMETADATA(),
      ['consumerId', 'projectId', 'workspaceId', 'test-id', 'event_code_1',
        mock.data.createEventMetadataBadRequest])
  })
})

describe('Delete eventmetadata', () => {
  it('Success on delete eventmetadata', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteEventMetadata('consumerId', 'projectId',
      'workspaceId', 'test-id', 'event_code_1')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete eventmetadata', async () => {
    const api = 'deleteEventMetadata'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_DELETE_EVENTMETADATA(),
      ['consumerId', 'projectId', 'workspaceId', 'test-id', 'event_code_2'])
  })
})

describe('Delete all eventmetadata', () => {
  it('Success on delete all eventmetadata', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteAllEventMetadata('consumerId', 'projectId',
      'workspaceId', 'test-id')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete all eventmetadata', async () => {
    const api = 'deleteAllEventMetadata'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api,
      new errorSDK.codes.ERROR_DELETE_ALL_EVENTMETADATA(),
      ['consumerId', 'projectId', 'workspaceId', 'test-id'])
  })
})

describe('Create registration', () => {
  it('Success on create registration', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.createRegistrationResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.createRegistration('consumerId', 'projectId', 'workspaceId', mock.data.createRegistration)
    expect(res.id).toBe(248723)
    expect(res.webhook_status).toBe('verified')
    expect(res.enabled).toBe(true)
  })
  it('Bad request error on create registration', async () => {
    const api = 'createRegistration'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_CREATE_REGISTRATION(), ['consumerId', 'projectId', 'workspaceId', mock.data.createRegistrationBadRequest])
  })
  it('Conflcit in name on create registration', async () => {
    const api = 'createRegistration'
    const mockHeaders = {}
    mockHeaders['x-conflicting-id'] = CONFLICTING_ID
    exponentialBackoffMockReturnValue({}, { status: 409, statusText: 'Conflict', headers: mockHeaders })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_CREATE_REGISTRATION(), ['consumerId', 'projectId', 'workspaceId', mock.data.createRegistrationBadRequest])
  })
})

describe('Update registration', () => {
  it('Success on update registration', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.updateRegistrationResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.updateRegistration('consumerId', 'projectId', 'workspaceId', 'registrationId', mock.data.updateRegistration)
    expect(res.id).toBe(248723)
    expect(res.webhook_status).toBe('verified')
    expect(res.delivery_type).toBe('webhook_batch')
    expect(res.enabled).toBe(true)
  })
  it('Bad request error on update registration', async () => {
    const api = 'updateRegistration'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_UPDATE_REGISTRATION(), ['consumerId', 'projectId', 'workspaceId', 'registrationId', mock.data.createRegistrationBadRequest])
  })
})

describe('Get all registration', () => {
  it('Success on get all registration', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getAllRegistrationsResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllRegistrationsForWorkspace('consumerId', 'projectId', 'workspaceId')
    expect(res._embedded.registrations.length).toBe(3)
    const regs = res._embedded.registrations
    expect(res._links.self.href).toBe(EVENTS_BASE_URL + '/consumerId/projectId/workspaceId/registrations')
    expect(regs[0].id).toBe(30000)
    expect(regs[1].webhook_status).toBe('hook_unreachable')
    expect(regs[2].delivery_type).toBe('journal')
  })
  it('Not found error on get all registration', async () => {
    const api = 'getAllRegistrationsForWorkspace'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_REGISTRATION(), ['consumerId', 'project-1', 'workspace-1'])
  })
})

describe('Get a registration', () => {
  it('Success on get a  registration', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.createRegistrationResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getRegistration('consumerId', 'projectId', 'workspaceId', 'registrationId')
    expect(res._links.self.href).toBe(EVENTS_BASE_URL + '/consumerId/projectId/workspaceId/registrations/registrationId')
    expect(res.id).toBe(248723)
    expect(res.webhook_status).toBe('verified')
    expect(res.enabled).toBe(true)
  })
  it('Not found error on get a registration', async () => {
    const api = 'getRegistration'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_REGISTRATION(), ['consumerId', 'projectId', 'workspaceId', 'registrationId-1'])
  })
})

describe('Get all registrations for org', () => {
  it('Success on get all registrations for org', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(mock.data.getAllRegistrationsForOrgResponse, { status: 200, statusText: 'OK' })
    const res = await sdkClient.getAllRegistrationsForOrg('consumerId', { page: 1, size: 2 })
    expect(res._links.self.href).toBe(EVENTS_BASE_URL + '/consumerId/registrations?page=1&size=2')
    expect(res._links.first.href).toBe(EVENTS_BASE_URL + '/consumerId/registrations?page=0&size=2')
    expect(res._links.last.href).toBe(EVENTS_BASE_URL + '/consumerId/registrations?page=19&size=2')
    expect(res._links.prev.href).toBe(EVENTS_BASE_URL + '/consumerId/registrations?page=0&size=2')
    expect(res._embedded.registrations.length).toBe(2)
    expect(res.page.numberOfElements).toBe(2)
    expect(res.page.totalElements).toBe(19)
  })
  it('Not found error on get a registration', async () => {
    const api = 'getAllRegistrationsForOrg'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_ALL_REGISTRATIONS_FOR_ORG(), ['consumerId-2'])
  })
})

describe('Get registration with retries', () => {
  it('Test for retries on 5xx response', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, { retries: 3 })
    const error = new errorSDK.codes.ERROR_GET_REGISTRATION()
    exponentialBackoffMockReturnValue({}, { status: 500, statusText: 'Internal Server Error', url: journalUrl })
    await sdkClient.getRegistration('consumerId', 'projectId', 'workspaceId', 'registrationId')
      .then(res => {
        throw new Error(' No error response')
      })
      .catch(e => {
        expect(e.name).toEqual(error.name)
        expect(e.code).toEqual(error.code)
      })
    expect(fetchRetry.exponentialBackoff).toHaveBeenCalledWith(
      EVENTS_BASE_URL + '/consumerId/projectId/workspaceId/registrations/registrationId',
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

describe('test delete registration', () => {
  it('Success on delete registration', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, { status: 204, statusText: 'No Content' })
    const res = await sdkClient.deleteRegistration('consumerId', 'projectId', 'workspaceId',
      'registrationId')
    expect(res).toBe(undefined)
  })
  it('Not found error on delete registration', () => {
    const api = 'deleteRegistration'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    checkErrorResponse(api, new errorSDK.codes.ERROR_DELETE_REGISTRATION(),
      ['consumerId', 'integrationId', 'registrationId1'])
  })
})

describe('Publish event', () => {
  it('200 OK on publish event', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue('OK', { status: 200, statusText: 'OK' })
    const res1 = await sdkClient.publishEvent(mock.data.cloudEvent)
    expect(res1).toBe('"OK"')
  })
  it('204 No Content on publish event', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue('No Content', { status: 204, statusText: 'No Content' })
    const res2 = await sdkClient.publishEvent(mock.data.cloudEvent)
    expect(res2).toBe(undefined)
  })
  it('Bad request error on publish event', async () => {
    const api = 'publishEvent'
    exponentialBackoffMockReturnValue({}, { status: 400, statusText: 'Bad Request' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_PUBLISH_EVENT(), [mock.data.cloudEventEmptyPayload])
  })
})

describe('Publish event with retries', () => {
  it('Test for retries on 5xx response', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, { retries: 3 })
    const retryOnSpy = jest.spyOn(sdkClient, '__getRetryOn')
    const error = new errorSDK.codes.ERROR_PUBLISH_EVENT()
    exponentialBackoffMockReturnValue({}, { status: 500, statusText: 'Internal Server Error', url: 'https://eventsingress.adobe.io' })
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
    exponentialBackoffMockReturnValue(mock.data.journalResponseBody, mock.data.journalResponseHeader200)
    const res1 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res1.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res1.events[0].position).toBe('position-2')
    expect(res1.responseHeaders).toBeUndefined()
  })
  it('204 response on fetch from journal with retry after as number', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, mock.data.journalResponseHeader204)
    const res2 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res2.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res2.retryAfter).toBe(10000)
  })
  it('204 response on fetch from journal with invalid retry after', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, mock.data.journalResponseHeader204InvalidTime)
    const res2 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res2.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res2.retryAfter).toBe(undefined)
  })
  it('204 response on fetch from journal with retry after as date time string', async () => {
    const sdkClient = await createSdkClient()
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 0)
    global.Date.now = dateNowStub
    exponentialBackoffMockReturnValue(undefined, mock.data.journalResponseHeader204DateTime)
    const res3 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res3.link.next).toBe('http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1')
    expect(res3.retryAfter).toBe(10000)
    global.Date.now = realDateNow
  })
  it('204 response on fetch from journal with missing links header', async () => {
    const sdkClient = await createSdkClient()
    exponentialBackoffMockReturnValue(undefined, mock.data.journalResponseHeader204MissingLinks)
    const res4 = await sdkClient.getEventsFromJournal(journalUrl)
    expect(res4.link).toBe(undefined)
    expect(res4.retryAfter).toBe(10000)
  })
  it('429 response on fetch from journal', async () => {
    const api = 'getEventsFromJournal'
    exponentialBackoffMockReturnValue({}, { status: 429, statusText: 'Too Many Requests' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_JOURNAL_DATA(), [journalUrl])
  })
  it('Not found error on fetch from journal', async () => {
    const api = 'getEventsFromJournal'
    exponentialBackoffMockReturnValue({}, { status: 404, statusText: 'Not Found' })
    await checkErrorResponse(api, new errorSDK.codes.ERROR_GET_JOURNAL_DATA(), [journalUrl])
  })
  it('Fetch from journal with retries', async () => {
    const sdkClient = await sdk.init(gOrganizationId, gApiKey, gAccessToken, { retries: 3 })
    const retryOnSpy = jest.spyOn(sdkClient, '__getRetryOn')
    const error = new errorSDK.codes.ERROR_GET_JOURNAL_DATA()
    exponentialBackoffMockReturnValue({}, { status: 500, statusText: 'Internal Server Error', url: journalUrl })
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
    exponentialBackoffMockReturnValue(mock.data.journalResponseBody, mock.data.journalResponseHeader200)
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
function exponentialBackoffMockReturnValue (mockResponse, mockHeader) {
  mockExponentialBackoff.mockReturnValue(
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
        if (e.code === 409) {
          expect(e.conflictingId).toEqual(CONFLICTING_ID)
        }
        resolve()
      })
  })
}
