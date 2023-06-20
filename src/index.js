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
/**
 * Adobe I/O Events SDK
 */

'use strict'

/* global Observable */ // for linter

const helpers = require('./helpers').exportFunctions
const signatureUtils = require('../src/signatureUtils').exportFunctions
const loggerNamespace = '@adobe/aio-lib-events'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace,
  { level: process.env.LOG_LEVEL })
const { codes } = require('./SDKErrors')
const { HttpExponentialBackoff } = require('@adobe/aio-lib-core-networking')
const fetchRetryClient = new HttpExponentialBackoff()

const EventsConsumerFromJournal = require('./journalling')

/**
 * @typedef {object} EventsCoreAPIOptions
 * @property {number} [timeout] Http request timeout in ms (optional)
 * @property {number} [retries] Number of retries in case of 5xx errors. Default 0 (optional)
 * @property {string} [eventsBaseURL] Base URL for Events Default https://api.adobe.io (optional)
 * @property {string} [eventsIngressURL] Ingress URL for Events. Default https://eventsingress.adobe.io (optional)
 */
/**
 * Returns a Promise that resolves with a new EventsCoreAPI object.
 *
 * @param {string} organizationId The organization id from your integration
 * @param {string} apiKey The api key from your integration
 * @param {string} accessToken JWT Token for the integration with IO Management API scope
 * @param {EventsCoreAPIOptions} [httpOptions] Options to configure API calls
 * @returns {Promise<EventsCoreAPI>} returns object of the class EventsCoreAPI
 */
function init (organizationId, apiKey, accessToken, httpOptions) {
  return new Promise((resolve, reject) => {
    const clientWrapper = new EventsCoreAPI()

    clientWrapper.init(organizationId, apiKey, accessToken, httpOptions)
      .then(initializedSDK => {
        logger.debug('sdk initialized successfully')
        resolve(initializedSDK)
      })
      .catch(err => {
        logger.debug(`sdk init error: ${err}`)
        reject(err)
      })
  })
}

/**
 * This class provides methods to call your Adobe I/O Events APIs.
 * Before calling any method initialize the instance by calling the `init` method on it
 * with valid values for organizationId, apiKey, accessToken and optional http options such as timeout
 * and max number of retries
 */
class EventsCoreAPI {
  /**
   * Initialize SDK.
   *
   * @param {string} organizationId The organization id from your integration
   * @param {string} apiKey The api key from your integration
   * @param {string} accessToken JWT Token for the integration with IO Management API scope
   * @param {EventsCoreAPIOptions} [httpOptions] Options to configure API calls
   * @returns {Promise<EventsCoreAPI>} returns object of the class EventsCoreAPI
   */
  async init (organizationId, apiKey, accessToken, httpOptions) {
    const initErrors = []
    if (!organizationId) {
      initErrors.push('organizationId')
    }
    if (!apiKey) {
      initErrors.push('apiKey')
    }
    if (!accessToken) {
      initErrors.push('accessToken')
    }

    if (initErrors.length) {
      const sdkDetails = { organizationId, apiKey, accessToken }
      throw new codes.ERROR_SDK_INITIALIZATION({ sdkDetails, messageValues: `${initErrors.join(', ')}` })
    }
    /** Http options {retries, timeout} */
    this.httpOptions = httpOptions
    /** The organization id from your integration */
    this.organizationId = organizationId
    /** The api key from your integration */
    this.apiKey = apiKey
    /** The JWT Token for the integration with IO Management API scope */
    this.accessToken = accessToken
    /** Initialise base and Ingress URLs */
    this.__initLibURLs()

    return this
  }

  /**
   * =========================================================================
   * GET/POST/PUT/DELETE Providers
   * =========================================================================
   */

  /**
   * @typedef {object} ProviderOptions
   * @property {string} [providerMetadataId] Fetch by providerMetadataId for the consumer org
   * @property {string} [instanceId] For Self registered providers, instanceId is a must while fetching by providerMetadataId
   * @property {Array} [providerMetadataIds] Fetch all providers ( and all instances ) for the list of provider metadata ids
   */
  /**
   * Fetch all the providers
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {boolean} fetchEventMetadata Option to fetch event metadata for each of the the providers in the list
   * @param {ProviderOptions} providerOptions Provider filtering options based on either (providerMetadataId and instanceId) or list of providerMetadataIds
   * @returns {Promise<object>} Returns list of providers for the org
   */
  getAllProviders (consumerOrgId, fetchEventMetadata = false, providerOptions = {}) {
    const headers = {}
    if (providerOptions && providerOptions.providerMetadataIds && providerOptions.providerMetadataId) {
      return Promise.reject(new codes.ERROR_GET_ALL_PROVIDERS({ messageValues: 'Only one of providerMetadataIds or providerMetadataId can be set' }))
    }
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/providers`)
    let urlWithQueryParams = helpers.appendQueryParams(url, providerOptions)
    urlWithQueryParams = helpers.appendQueryParams(urlWithQueryParams, { eventmetadata: fetchEventMetadata })
    const sdkDetails = { requestOptions: requestOptions, url: urlWithQueryParams }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_ALL_PROVIDERS)
  }

  /**
   * Fetch a provider
   *
   * @param {string} providerId The id that uniquely identifies the provider to be fetched
   * @param {boolean} [fetchEventMetadata] Set this to true if you want to fetch the associated eventmetadata of the provider
   * @returns {Promise<object>} Returns the provider specified by the provider id
   */
  getProvider (providerId, fetchEventMetadata = false) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/providers/${providerId}`)
    const urlWithQueryParams = helpers.appendQueryParams(url, { eventmetadata: fetchEventMetadata })
    const sdkDetails = { requestOptions: requestOptions, url: urlWithQueryParams }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_PROVIDER)
  }

  /**
   * @typedef {object} ProviderInputModel
   * @property {string} label The label of this Events Provider
   * @property {string} [description] The description of this Events Provider
   * @property {string} [docs_url] The documentation url of this Events Provider
   */
  /**
   * Create a new provider given the provider details
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {ProviderInputModel} body Json data that describes the provider
   * @returns {Promise<object>} Returns the details of the provider created
   */
  createProvider (consumerOrgId, projectId, workspaceId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('POST', headers,
      JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_CREATE_PROVIDER)
  }

  /**
   * Update a provider given the id and provider details
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId The id that uniquely identifies the provider to be updated
   * @param {ProviderInputModel} body Json data that describes the provider
   * @returns {Promise<object>} Returns the details of the provider updated
   */
  updateProvider (consumerOrgId, projectId, workspaceId, providerId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('PUT', headers,
      JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_UPDATE_PROVIDER)
  }

  /**
   * Delete a provider given the id
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId The id that uniquely identifies the provider to be deleted
   * @returns {Promise<object>} Returns an empty object if the deletion was successful
   */
  deleteProvider (consumerOrgId, projectId, workspaceId, providerId) {
    const headers = {}
    const requestOptions = this.__createRequest('DELETE', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_DELETE_PROVIDER)
  }

  /**
   * =========================================================================
   * GET Entitled Provider Metadata
   * =========================================================================
   */

  /**
   * @returns {Promise<object>} Returns the list of all entitled provider metadata for the org
   */
  getProviderMetadata () {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl('/events/providermetadata')
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_ALL_PROVIDER_METADATA)
  }

  /**
   * =========================================================================
   * GET/POST/PUT/DELETE Event Metadata
   * =========================================================================
   */

  /**
   * Get all event metadata for a provider
   *
   * @param {string} providerId The id that uniquely identifies the provider whose event metadata is to be fetched
   * @returns {Promise<object>} List of all event metadata of the provider
   */
  getAllEventMetadataForProvider (providerId) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/providers/${providerId}/eventmetadata`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_ALL_EVENTMETADATA)
  }

  /**
   * Get an event metadata for given provider and event code
   *
   * @param {string} providerId The id that uniquely identifies the provider whose event metadata is to be fetched
   * @param {string} eventCode The specific event code for which the details of the event metadata is to be fetched
   * @returns {Promise<object>} Event metadata that corresponds to the specified event code
   */
  getEventMetadataForProvider (providerId, eventCode) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/providers/${providerId}/eventmetadata/${eventCode}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_EVENTMETADATA)
  }

  /**
   * @typedef {object} EventMetadataInputModel
   * @property {string} label The description of this Event Metadata
   * @property {string} description The label of this Event Metadata
   * @property {string} event_code The event_code of this Event Metadata. This event_code describes the type of event. Ideally it should be prefixed with a reverse-DNS name (dictating the organization which defines the semantics of this event type) It is equivalent to the CloudEvents' type. See https://github.com/cloudevents/spec/blob/master/spec.md#type
   * @property {string} [sample_event_template] An optional base64 encoded sample event template
   */
  /**
   * Create an event metadata for a provider
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId provider for which the event metadata is to be added
   * @param {EventMetadataInputModel} body Json data that describes the event metadata
   * @returns {Promise<object>} Details of the event metadata created
   */
  createEventMetadataForProvider (consumerOrgId, projectId, workspaceId, providerId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('POST', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}/eventmetadata`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_CREATE_EVENTMETADATA)
  }

  /**
   * Update the event metadata for a provider
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId provider for which the event metadata is to be updated
   * @param {string} eventCode eventCode of the event metadata to be updated
   * @param {EventMetadataInputModel} body Json data that describes the event metadata
   * @returns {Promise<object>} Details of the event metadata updated
   */
  updateEventMetadataForProvider (consumerOrgId, projectId, workspaceId, providerId, eventCode, body) {
    const headers = {}
    const requestOptions = this.__createRequest('PUT', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}/eventmetadata/${eventCode}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_UPDATE_EVENTMETADATA)
  }

  /**
   * Delete an event metadata of a provider
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId provider for which the event metadata is to be updated
   * @param {string} eventCode eventCode of the event metadata to be updated
   * @returns {Promise<object>} Empty object if deletion was successful
   */
  deleteEventMetadata (consumerOrgId, projectId, workspaceId, providerId, eventCode) {
    const headers = {}
    const requestOptions = this.__createRequest('DELETE', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}/eventmetadata/${eventCode}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_DELETE_EVENTMETADATA)
  }

  /**
   * Delete all event metadata of a provider
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId provider for which the event metadata is to be updated
   * @returns {Promise<object>} Empty object if deletion was successful
   */
  deleteAllEventMetadata (consumerOrgId, projectId, workspaceId, providerId) {
    const headers = {}
    const requestOptions = this.__createRequest('DELETE', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}/eventmetadata`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_DELETE_ALL_EVENTMETADATA)
  }

  /**
   * =========================================================================
   * GET/POST/PUT/DELETE Webhook and Journal Regsitrations
   * =========================================================================
   */

  /**
   * @typedef {object} EventsOfInterest
   * @property {string} provider_id The id of the provider of the events to be subscribed
   * @property {string} event_code The requested valid event code belonging to the provider
   */
  /**
   * @typedef {object} RegistrationCreateModel
   * @property {string} client_id Client id for which the registration is created
   * @property {string} name The name of the registration
   * @property {string} description The description of the registration
   * @property {string} [webhook_url] A valid webhook url where the events would be delivered for webhook or webhook_batch delivery_type
   * @property {Array.<EventsOfInterest>} events_of_interest The events for which the registration is to be subscribed to
   * @property {string} delivery_type Delivery type can either be webhook|webhook_batch|journal.
   * @property {string} [enabled] Enable or disable the registration. Default true.
   */
  /**
   * Create a webhook or journal registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {RegistrationCreateModel} body Json data contains details of the registration
   * @returns {Promise<object>} Details of the webhook/journal registration created
   */
  createRegistration (consumerOrgId, projectId, workspaceId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('POST', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/registrations`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_CREATE_REGISTRATION)
  }

  /**
   * @typedef {object} RegistrationUpdateModel
   * @property {string} name The name of the registration
   * @property {string} description The description of the registration
   * @property {string} [webhook_url] A valid webhook url where the events would be delivered for webhook or webhook_batch delivery_type
   * @property {Array.<EventsOfInterest>} events_of_interest The events for which the registration is to be subscribed to
   * @property {string} delivery_type Delivery type can either be webhook|webhook_batch|journal.
   * @property {string} [enabled] Enable or disable the registration. Default true.
   */
  /**
   * Update a webhook or journal registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} registrationId Registration id whose details are to be fetched
   * @param {RegistrationUpdateModel} body Json data contains details of the registration
   * @returns {Promise<object>} Details of the webhook/journal registration to be updated
   */
  updateRegistration (consumerOrgId, projectId, workspaceId, registrationId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('PUT', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/registrations/${registrationId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_UPDATE_REGISTRATION)
  }

  /**
   * Get registration details for a given registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} registrationId Registration id whose details are to be fetched
   * @returns {Promise<object>} Details of the webhook/journal registration
   */
  getRegistration (consumerOrgId, projectId, workspaceId, registrationId) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/registrations/${registrationId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_REGISTRATION)
  }

  /**
   * Get all registration details for a workspace
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @returns {Promise<object>} List of all webhook/journal registrations
   */
  getAllRegistrationsForWorkspace (consumerOrgId, projectId, workspaceId) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/registrations`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_ALL_REGISTRATION)
  }

  /**
   * @typedef {object} Page
   * @property {number} [page] page number to be fetched. Default 0 (optional)
   * @property {number} [size] size of each page. Default 10 (optional)
   */
  /**
   * Get all registration details for an org
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {Page} [page] page size and page number
   * @returns {Promise<object>} Paginated response of all webhook/journal registrations for an org
   */
  getAllRegistrationsForOrg (consumerOrgId, page = {}) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/registrations`)
    const urlWithQueryParams = helpers.appendQueryParams(url, page)
    const sdkDetails = { requestOptions: requestOptions, url: urlWithQueryParams }
    return this.__handleRequest(sdkDetails, codes.ERROR_GET_ALL_REGISTRATIONS_FOR_ORG)
  }

  /**
   * Delete webhook registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} registrationId Id of the registration to be deleted
   * @returns {Promise<object>} Empty object if deletion was successful
   */
  deleteRegistration (consumerOrgId, projectId, workspaceId, registrationId) {
    const headers = {}
    const requestOptions = this.__createRequest('DELETE', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/registrations/${registrationId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(sdkDetails, codes.ERROR_DELETE_REGISTRATION)
  }

  /**
   * =========================================================================
   * Event Publisher
   * =========================================================================
   */

  /**
   * Publish Cloud Events
   *
   * Event publishers can publish events to the Adobe I/O Events using this SDK. The events should follow Cloud Events 1.0 specification: https://github.com/cloudevents/spec/blob/v1.0/spec.md.
   * As of now, only application/json is accepted as the content-type for the "data" field of the cloud event.
   * If retries are set, publish events are retried on network issues, 5xx and 429 error response codes.
   *
   * @param {object} cloudEvent Object to be published to event receiver in cloud event format
   * @returns {Promise<string>} Returns OK/ undefined in case of success and error in case of failure
   */
  publishEvent (cloudEvent) {
    const headers = {}
    headers['Content-Type'] = 'application/cloudevents+json'
    const requestOptions = this.__createRequest('POST', headers, JSON.stringify(cloudEvent))
    const retries = (this.httpOptions && this.httpOptions.retries) || 0
    const url = this.httpOptions.eventsIngressURL
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return new Promise((resolve, reject) => {
      fetchRetryClient.exponentialBackoff(url, requestOptions, { maxRetries: retries, initialDelayInMillis: 1000 }, this.__getRetryOn(retries))
        .then((response) => {
          if (!response.ok) {
            sdkDetails.requestId = response.headers.get('x-request-id')
            throw Error(helpers.reduceError(response))
          }
          if (response.status === 200) { resolve(response.text()) } else { resolve() }
        })
        .catch(err => {
          this.__maskAuthData(sdkDetails)
          reject(new codes.ERROR_PUBLISH_EVENT({ sdkDetails, messageValues: err }))
        })
    })
  }

  /**
   * =========================================================================
   * Event Journalling
   * =========================================================================
   */

  /**
   * @typedef {object} EventsJournalOptions
   * @property {boolean} [latest] Retrieve latest events (optional)
   * @property {string} [since] Position at which to start fetching the events from (optional)
   * @property {number} [limit] Maximum number of events to retrieve (optional)
   */
  /**
   * Get events from a journal.
   *
   * @param {string} journalUrl URL of the journal or 'next' link to read from (required)
   * @param {EventsJournalOptions} [eventsJournalOptions] Query options to send with the URL
   * @param {boolean} [fetchResponseHeaders] Set this to true if you want to fetch the complete response headers
   * @returns {Promise<object>} with the response json includes events and links (if available)
   */
  async getEventsFromJournal (journalUrl, eventsJournalOptions, fetchResponseHeaders) {
    const url = helpers.appendQueryParams(journalUrl, eventsJournalOptions)
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    const retries = (this.httpOptions && this.httpOptions.retries) || 0
    const response = await fetchRetryClient.exponentialBackoff(url, requestOptions, { maxRetries: retries, initialDelayInMillis: 1000 }, this.__getRetryOn(retries))
    if ((response.status === 200) || (response.status === 204)) {
      const resultBody = await ((response.status === 200) ? response.json() : {})
      const result = Object.assign({}, resultBody)
      const linkHeader = response.headers.get('link')
      const retryAfterHeader = response.headers.get('retry-after')
      if (linkHeader) {
        result.link = helpers.parseLinkHeader(journalUrl, linkHeader)
      }
      if (retryAfterHeader) {
        result.retryAfter = helpers.parseRetryAfterHeader(retryAfterHeader)
      }
      if (fetchResponseHeaders) {
        result.responseHeaders = response.headers.raw()
      }
      return new Promise((resolve, reject) => {
        resolve(result)
      })
    } else {
      return new Promise((resolve, reject) => {
        this.__maskAuthData(sdkDetails)
        reject(
          new codes.ERROR_GET_JOURNAL_DATA({
            sdkDetails,
            messageValues: new Error(`get journal events failed with ${response.status} ${response.statusText}`)
          }))
      })
    }
  }

  /**
   * @typedef {object} EventsJournalPollingOptions
   * @property {number} [interval] Interval at which to poll the journal; If not provided, a default value will be used (optional)
   */
  /**
   * getEventsObservableFromJournal returns an RxJS <a href="https://rxjs-dev.firebaseapp.com/guide/observable">Observable</a>
   *
   * One can go through the extensive documentation on <a href="https://rxjs-dev.firebaseapp.com/guide/overview">RxJS</a> in order to learn more
   * and leverage the various <a href="https://rxjs-dev.firebaseapp.com/guide/operators">RxJS Operators</a> to act on emitted events.
   *
   * @param {string} journalUrl URL of the journal or 'next' link to read from (required)
   * @param {EventsJournalOptions} [eventsJournalOptions] Query options to send with the Journal URL
   * @param {EventsJournalPollingOptions} [eventsJournalPollingOptions] Journal polling options
   * @returns {Observable} observable to which the user can subscribe to in order to listen to events
   */
  getEventsObservableFromJournal (journalUrl, eventsJournalOptions, eventsJournalPollingOptions) {
    return (new EventsConsumerFromJournal(this, journalUrl, eventsJournalOptions, eventsJournalPollingOptions)).asObservable()
  }

  /**
   * Authenticating events by verifying digital signature
   *
   * @param {*} event JSON payload delivered to the registered webhook URL
   * @param {*} recipientClientId Target recipient client id retrieved from the Adobe I/O Console integration
   * @param {*} signatureOptions map of all digital signature header values consisting fields as below
   * digiSignature1 : Value of digital signature retrieved from the x-adobe-digital-signature1 header in each POST request to webhook
   * digiSignature2 : Value of digital signature retrieved from the x-adobe-digital-signature2 header in each POST request to webhook
   * publicKeyPath1 : Relative path of ioevents public key retrieved from the x-adobe-public-key1-path header in each POST request to webhook
   * publicKeyPath2 : Relative path of ioevents public key retrieved from the x-adobe-public-key2-path header in each POST request to webhook
   * @returns {boolean} If signature matches return true else return false
   */
  async verifyDigitalSignatureForEvent (event, recipientClientId, signatureOptions) {
    // check event payload and get proper payload used in I/O Events signing
    const rawSignedPayload = helpers.getProperPayload(event)

    // check if the target recipient is present in event and is a valid one, then verify the signature else return error
    const parsedJsonPayoad = JSON.parse(rawSignedPayload)
    if (signatureUtils.isTargetRecipient(parsedJsonPayoad, recipientClientId)) {
      return await signatureUtils.verifyDigitalSignature(signatureOptions, recipientClientId, rawSignedPayload)
    } else {
      const message = 'Unable to authenticate, not a valid target recipient'
      return helpers.genErrorResponse(401, message)
    }
  }

  /**
   * The function that evaluates the condition for retries.
   * The retryOn function must return a boolean on evaluation
   *
   * @param {number} retries Max number of retries
   * @returns {Function} retryOnFunction {function(...[*]=)}
   * @private
   */
  __getRetryOn (retries) {
    return function (attempt, error, response) {
      if (attempt < retries && (error !== null ||
        response.status === 429 ||
        (response.status > 499 && response.status < 600))) {
        const msg = `Retrying after attempt ${attempt + 1}. failed: ${error || response.statusText}`
        logger.debug(msg)
        return true
      }
      return false
    }
  }

  /**
   * =========================================================================
   * Utilities
   * =========================================================================
   */

  /**
   * Handle HTTP requests and return a promise
   *
   * @param {string} url URL for the request
   * @param {object} requestOptions Request options such as body, headers, method
   * @param {object} sdkDetails SDK details for logging
   * @param {object} ErrorCode API specific error code
   * @returns {Promise<object>} returns the json result
   * @private
   */
  __handleRequest (sdkDetails, ErrorCode) {
    return new Promise((resolve, reject) => {
      fetchRetryClient.exponentialBackoff(sdkDetails.url, sdkDetails.requestOptions, { maxRetries: (this.httpOptions && this.httpOptions.retries) || 0, initialDelayInMillis: 1000 })
        .then((response) => {
          if (!response.ok) {
            sdkDetails.requestId = response.headers.get('x-request-id')
            throw Error(helpers.reduceError(response))
          }
          if (response.status === 204) { resolve() } else { resolve(response.json()) }
        })
        .catch(err => {
          this.__maskAuthData(sdkDetails)
          reject(new ErrorCode({ sdkDetails, messageValues: err }))
        })
    })
  }

  /**
   * Create Request Options
   *
   * @param {string} method GET/PUT/POST/DELETE
   * @param {object} headers Headers for the request
   * @param {object} [body] Body of the request. Can be undefined
   * @returns {{headers: *, method: *, body: *, timeout: number}} Returns json object containing request options
   * @private
   */
  __createRequest (method, headers, body) {
    return {
      method: method,
      headers: this.__setHeaders(headers),
      body: body,
      timeout: this.httpOptions && this.httpOptions.timeout
    }
  }

  /**
   * Hides sensitive information
   *
   * @param {object} sdkDetails SDK details to be logged in case of error
   * @private
   */
  __maskAuthData (sdkDetails) {
    sdkDetails.requestOptions.headers.Authorization = '***'
    sdkDetails.requestOptions.headers['x-api-key'] = '***'
  }

  /**
   * Set headers for every request
   *
   * @param {object} headers Empty headers or headers with prefilled custom values
   * @returns {object} Headers common for all requests
   * @private
   */
  __setHeaders (headers) {
    // set headers required for Target API calls
    if (!headers['x-ims-org-id']) {
      headers['x-ims-org-id'] = this.organizationId
    }
    if (!headers['x-api-key']) {
      headers['x-api-key'] = this.apiKey
    }
    if (!headers.Authorization) {
      headers.Authorization = 'Bearer ' + this.accessToken
    }
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  __getUrl (path) {
    return this.httpOptions.eventsBaseURL + path
  }

  __initLibURLs () {
    this.httpOptions = this.httpOptions || {}
    this.httpOptions.eventsBaseURL = this.httpOptions.eventsBaseURL || 'https://api.adobe.io'
    this.httpOptions.eventsIngressURL = this.httpOptions.eventsIngressURL || 'https://eventsingress.adobe.io'
  }
}

module.exports = {
  init: init
}
