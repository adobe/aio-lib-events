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

const { reduceError, appendQueryParams, parseLinkHeader, parseRetryAfterHeader } = require('./helpers')
const loggerNamespace = '@adobe/aio-lib-events'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace,
  { level: process.env.LOG_LEVEL })
const { codes } = require('./SDKErrors')
const fetchRetryClient = require('@adobe/aio-lib-core-networking')
const stateLib = require('@adobe/aio-lib-state')
const fetch = require('node-fetch')
const crypto = require('crypto')
const hmacSHA256 = require('crypto-js/hmac-sha256')
const Base64 = require('crypto-js/enc-base64')

const EventsConsumerFromJournal = require('./journalling')

const EVENTS_BASE_URL = process.env.EVENTS_BASE_URL || 'https://api.adobe.io'
const EVENTS_INGRESS_URL = process.env.EVENTS_INGRESS_URL || 'https://eventsingress.adobe.io'
/**
 * @typedef {object} EventsCoreAPIOptions
 * @property {number} [timeout] Http request timeout in ms (optional)
 * @property {number} [retries] Number of retries in case of 5xx errors. Default 0 (optional)
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
    return this
  }

  /**
   * =========================================================================
   * GET/POST/PUT/DELETE Providers
   * =========================================================================
   */

  /**
   * Fetch all the providers
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @returns {Promise<object>} Returns list of providers for the org
   */
  getAllProviders (consumerOrgId) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/${consumerOrgId}/providers`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_GET_ALL_PROVIDERS)
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
    const url = this.__getUrl(`/events/providers/${providerId}?eventmetadata=${fetchEventMetadata}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_GET_PROVIDER)
  }

  /**
   * Create a new provider given the provider details
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {object} body Json data that describes the provider
   * @returns {Promise<object>} Returns the details of the provider created
   */
  createProvider (consumerOrgId, projectId, workspaceId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('POST', headers,
      JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_CREATE_PROVIDER)
  }

  /**
   * Update a provider given the id and provider details
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId The id that uniquely identifies the provider to be updated
   * @param {object} body Json data that describes the provider
   * @returns {Promise<object>} Returns the details of the provider updated
   */
  updateProvider (consumerOrgId, projectId, workspaceId, providerId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('PUT', headers,
      JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_UPDATE_PROVIDER)
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
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_DELETE_PROVIDER)
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
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_GET_ALL_EVENTMETADATA)
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
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_GET_EVENTMETADATA)
  }

  /**
   * Create an event metadata for a provider
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId provider for which the event metadata is to be added
   * @param {object} body Json data that describes the event metadata
   * @returns {Promise<object>} Details of the event metadata created
   */
  createEventMetadataForProvider (consumerOrgId, projectId, workspaceId, providerId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('POST', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}/eventmetadata`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_CREATE_EVENTMETADATA)
  }

  /**
   * Update the event metadata for a provider
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} projectId Project Id from the console
   * @param {string} workspaceId Workspace Id from the console
   * @param {string} providerId provider for which the event metadata is to be updated
   * @param {string} eventCode eventCode of the event metadata to be updated
   * @param {object} body Json data that describes the event metadata
   * @returns {Promise<object>} Details of the event metadata updated
   */
  updateEventMetadataForProvider (consumerOrgId, projectId, workspaceId, providerId, eventCode, body) {
    const headers = {}
    const requestOptions = this.__createRequest('PUT', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/${consumerOrgId}/${projectId}/${workspaceId}/providers/${providerId}/eventmetadata/${eventCode}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_UPDATE_EVENTMETADATA)
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
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_DELETE_EVENTMETADATA)
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
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_DELETE_ALL_EVENTMETADATA)
  }

  /**
   * =========================================================================
   * GET/POST/PUT/DELETE Webhook and Journal Regsitrations
   * =========================================================================
   */

  /**
   * Create a webhook or journal registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} integrationId integration Id from the console
   * @param {object} body Json data contains details of the registration
   * @returns {Promise<object>} Details of the webhook/journal registration created
   */
  createWebhookRegistration (consumerOrgId, integrationId, body) {
    const headers = {}
    const requestOptions = this.__createRequest('POST', headers, JSON.stringify(body))
    const url = this.__getUrl(`/events/organizations/${consumerOrgId}/integrations/${integrationId}/registrations`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_CREATE_REGISTRATION)
  }

  /**
   * Get registration details for a given registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} integrationId Integration Id from the console
   * @param {string} registrationId Registration id whose details are to be fetched
   * @returns {Promise<object>} Details of the webhook/journal registration
   */
  getWebhookRegistration (consumerOrgId, integrationId, registrationId) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/organizations/${consumerOrgId}/integrations/${integrationId}/registrations/${registrationId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_GET_REGISTRATION)
  }

  /**
   * Get all registration details for a given integration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} integrationId Integration Id from the console
   * @returns {Promise<object>} List of all webhook/journal registrations
   */
  getAllWebhookRegistrations (consumerOrgId, integrationId) {
    const headers = {}
    const requestOptions = this.__createRequest('GET', headers)
    const url = this.__getUrl(`/events/organizations/${consumerOrgId}/integrations/${integrationId}/registrations`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_GET_ALL_REGISTRATION)
  }

  /**
   * Delete webhook registration
   *
   * @param {string} consumerOrgId Consumer Org Id from the console
   * @param {string} integrationId Integration Id from the console
   * @param {string} registrationId Id of the registration to be deleted
   * @returns {Promise<object>} Empty object if deletion was successful
   */
  deleteWebhookRegistration (consumerOrgId, integrationId, registrationId) {
    const headers = {}
    const requestOptions = this.__createRequest('DELETE', headers)
    const url = this.__getUrl(`/events/organizations/${consumerOrgId}/integrations/${integrationId}/registrations/${registrationId}`)
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return this.__handleRequest(url, requestOptions, sdkDetails, codes.ERROR_DELETE_REGISTRATION)
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
    const url = EVENTS_INGRESS_URL
    const sdkDetails = { requestOptions: requestOptions, url: url }
    return new Promise((resolve, reject) => {
      fetchRetryClient.exponentialBackoff(url, requestOptions, { maxRetries: retries, initialDelayInMillis: 1000 }, this.__getRetryOn(retries))
        .then((response) => {
          if (!response.ok) {
            sdkDetails.requestId = response.headers.get('x-request-id')
            throw Error(reduceError(response))
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
    const url = appendQueryParams(journalUrl, eventsJournalOptions)
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
        result.link = parseLinkHeader(journalUrl, linkHeader)
      }
      if (retryAfterHeader) {
        result.retryAfter = parseRetryAfterHeader(retryAfterHeader)
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
   * Authenticating events by verifying signature
   *
   * @param {object} event JSON payload delivered to the registered webhook URL
   * @param {string} clientSecret Client secret can be retrieved from the Adobe I/O Console integration
   * @param {string} signatureHeaderValue Value of x-adobe-signature header in each POST request to the registered webhook URL
   * @returns {boolean} If signature matches return true else return false
   */
  /**
   * Authenticating events by verifying signature
   * 
   * @param {*} event JSON payload delivered to the registered webhook URL
   * @param {*} clientSecret Client secret can be retrieved from the Adobe I/O Console integration
   * @param {*} recipientClientId Target recipient client id retrieved from the Adobe I/O Console integration
   * @param {*} deprecatedSignature Value of HMAC signature retrieved from the x-adobe-signature header in each POST request to the registered webhook URL
   * @param {*} digiSignature1 Value of digital signature retrieved from the x-adobe-digital-signature1 header in each POST request to webhook
   * @param {*} digiSignature2 Value of digital signature retrieved from the x-adobe-digital-signature2 header in each POST request to webhook
   * @param {*} publicKeyUrl1 Value of public key url retrieved from the x-adobe-public-key1-url header in each POST request to webhook
   * @param {*} publicKeyUrl2 Value of public key url retrieved from the x-adobe-public-key2-url header in each POST request to webhook
   * @returns {boolean} If signature matches return true else return false
   */
  async verifySignatureForEvent (event, clientSecret, recipientClientId, deprecatedSignature, digiSignature1, digiSignature2, publicKeyUrl1, publicKeyUrl2) {
    logger.info('inside the verify signature')
    // check for the old hmac based signature and validate.. TO BE DEPRECATED
    logger.info('secret is %s', clientSecret)
    /*if (clientSecret !== null && typeof (clientSecret) !== 'undefined') {
      const hmacDigest = Base64.stringify(hmacSHA256(JSON.stringify(event), clientSecret))
      return hmacDigest === deprecatedSignature
    }*/

    logger.info('verifying digital signature')
    // check event payload and get proper payload used in I/O Events signing
    const decodedJsonPayload = await this.__getProperPayload(event)

    // check if the target recipient is present in event and is a valid one, then verify the signature else return error
    if (this.__isTargetRecipient(decodedJsonPayload, recipientClientId)) {
      logger.info('target recipient is valid')
      //const stateLib = await State.init()
      const result = await this.__verifyDigitalSignature(digiSignature1, digiSignature2, publicKeyUrl1, publicKeyUrl2, recipientClientId, JSON.stringify(decodedJsonPayload))
      return result
    } else {
      const message = 'Unable to authenticate, not a valid target recipient'
      return this.__errorResponse(401, message)
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
   * Wrapper to check the event received by webhook
   * and return decoded (if encoded) and properly parsed payload
   * @param {*} event event payload received by webhook
   * @returns decoded and properly parsed payload
   */
  async __getProperPayload (event) {
    let decodedJsonPayload
    try {
      if (await this.__isBase64Encoded(event)) {
        decodedJsonPayload = JSON.parse(Buffer.from(event, 'base64').toString('utf-8'))
      } else {
        // parsing for non-encoded json payloads (e.g. custom events)
        decodedJsonPayload = JSON.parse(event)
      }
    } catch (error) {
      logger.error('error occured while checking payload' + error.message)
      return await this.__genErrorResponse(400, 'Failed to understand the payload')
    }
    return decodedJsonPayload
  }

  /**
   * Checks for the payload type if it is base64 encode or not
   * 
   * @param {*} eventPayload - the event payload received by the consumer webhook
   * @returns {boolean} true if encoded or false
   */
  async __isBase64Encoded (eventPayload) {
    return Buffer.from(eventPayload, 'base64').toString('base64') === eventPayload
  }

  /**
   * Wrapper to fetch the public key (either through aio-lib-state or cloud front url)
   * and verify the digital signatures
   * 
   * @param {*} digiSignature1 - I/O Events generated digital signature1
   * @param {*} digiSignature2 - I/O Events generated digital signature2
   * @param {*} pubKeyUrl1 - Cloud Front public key url1
   * @param {*} pubKeyUrl2 - Cloud Front public key url2
   * @param {*} recipientClientId - target recipient client id
   * @param {*} signedPayload - I/O Events proper signed payload
   * @returns {boolean} true if either signatures are valid or false 
   */
  async __verifyDigitalSignature (digiSignature1, digiSignature2, pubKeyUrl1, pubKeyUrl2, recipientClientId, signedPayload) {
    // fetch the encoded public keys from the shared package default params
    let pubKey1Pem, pubKey2Pem
    try {
      const state = await stateLib.init()
      logger.debug('aio state lib initialized')
      pubKey1Pem = await this.__fetchFromCacheOrApi(pubKeyUrl1, state)
      pubKey2Pem = await this.__fetchFromCacheOrApi(pubKeyUrl2, state)
    } catch (error) {
      logger.error('error occurred while fetching from the public key url %s or %s for client %s due to %s',
        pubKeyUrl1, pubKeyUrl2, recipientClientId, error.message)
      return this.__genErrorResponse(500, 'Error occurred while fetching Public Key')
    }
    // verify the digital signatures using public keys fetched from params
    return await this.__verifySignature(digiSignature1, digiSignature2, signedPayload, pubKey1Pem, pubKey2Pem, recipientClientId)
  }

  /**
   * Wrapper to fetch the key from aio-lib-state, if not present fetch using
   * the cloud front url and set in aio-lib-state 
   * 
   * @param {*} pubKeyUrl - cloud front url of format https://d2wbnl47xxxxx.cloudfront.net/pub-key-1.pem
   * @param {*} state - aio-lib-state client
   * @returns public key
   */
  async __fetchFromCacheOrApi (pubKeyUrl, state) {
    let publicKey, publicKeyFileName
    try {
      // public key url is the cloud front url in this format https://d2wbnl47xxxxx.cloudfront.net/pub-key-1.pem
      publicKeyFileName = pubKeyUrl.substring(pubKeyUrl.lastIndexOf('/') + 1)
      const res = await state.get(publicKeyFileName)
      publicKey = res.value
      logger.info('public key %s fetched from aio lib state', publicKey)
    } catch (error) {
      logger.error('error fetching from aio lib state due to => %s', error.message)
      throw error
    }

    if (publicKey) {
      return publicKey
    }

    logger.info('public key for url %s not present in state lib cache, fetching from api..', pubKeyUrl)
    // fetch from api and set in cache default expiry 24h
    publicKey = this.__fetchPublicKey(pubKeyUrl)
    await state.put(publicKeyFileName, { anObject: publicKey })
    logger.info('fetched key set in the aio lib state')
    return publicKey
  }

  /**
   * Fetches public key using the cloud front public key url
   * 
   * @param {*} publicKeyUrl - cloud front public key url of format 
   * https://d2wbnl47xxxxx.cloudfront.net/pub-key-1.pem
   * @returns public key
   */
  async __fetchPublicKey (publicKeyUrl) {
    let pubKey
    fetch(publicKeyUrl)
      .then(res => res.text())
      .then(text => {
        logger.debug('successfully fetched the public key %s from api', text)
        pubKey = text
      })
      .catch(err => {
        logger.error('error fetching the public key from api due to => %s', err.message)
        throw err
      })
    return pubKey
  }

  /**
   * Digital Signature Verification Helper
   * 
   * @param {*} digitalSignature1 - I/O Events generated digital signature1
   * @param {*} digitalSignature2 - I/O Events generated digital signature2
   * @param {*} signedPayload - I/O Events proper signed payload
   * @param {*} pubKey1Pem - I/O Events generated PEM encoded public key1
   * @param {*} pubKey2Pem - I/O Events generated PEM encoded public key1
   * @param {*} recipientClientId - target recipient client id
   * @returns {boolean} true if either signatures are valid or false
   */
  async __verifySignature (digitalSignature1, digitalSignature2, signedPayload, pubKey1Pem, pubKey2Pem, recipientClientId) {
    let result1, result2, publicKey1, publicKey2
    logger.info('verifying signature for sign -> %s and key -> %s', digitalSignature1, publicKey1)
    try {
      publicKey1 = this.__createCryptoPublicKey(pubKey1Pem)
      result1 = this.__cryptoVerify(digitalSignature1, publicKey1, signedPayload)
      if (result1) {
        logger.info('valid sign')
        return result1
      } 

      publicKey2 = this.__createCryptoPublicKey(pubKey2Pem)
      result2 = this.__cryptoVerify(digitalSignature2, publicKey2, signedPayload)
      return result2
    } catch (error) {
      logger.error('error occured while verifying digital signature for client id %s due to %s ', recipientClientId, error.message)
      return this.__genErrorResponse(500, 'error occured while verifying digital signature')
    }
  }

  /**
   * Crypto verifies the signature of the I/O Events signed payload
   * 
   * @param {*} signature I/O Events digital signature
   * @param {*} pubKey I/O Events public key
   * @param {*} signedPayload I/O Events signed payload 
   * @returns {boolean} true or false
   */
  async __cryptoVerify (signature, pubKey, signedPayload) {
    return crypto.verify('rsa-sha256', new TextEncoder().encode(signedPayload), pubKey, Buffer.from(signature, 'base64'))
  }

  async __createCryptoPublicKey (publicKey) {
    return crypto.createPublicKey(
      {
        key: publicKey,
        format: 'pem',
        type: 'spki'
      })
  }

  /**
   * Checks if the recipient client id is the valid target recipient of the event payload
   * 
   * @param {*} decodedJsonPayload a valid json event payload used in I/O Events signing
   * @param {*} recipientClientId target recipient client id
   * @returns {boolean} true if valid target recipient or false 
   */
  __isTargetRecipient (decodedJsonPayload, recipientClientId) {
    const targetRecipient = decodedJsonPayload.recipient_client_id
    if (targetRecipient !== null && typeof (targetRecipient) !== 'undefined') {
      return targetRecipient === recipientClientId
    }
    logger.info('target recipient client id is either null or missing')
    return false
  }

  /**
   * Generates generic error json response object based on HTTP error codes and message
   * 
   * @param {*} statusCode HTTP error codes
   * @param {*} message custom error message
   */
  async __genErrorResponse (statusCode, message) {
    const response = {
      statusCode: statusCode,
      body: message,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    return {
      error: response
    }
  }

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
  __handleRequest (url, requestOptions, sdkDetails, ErrorCode) {
    return new Promise((resolve, reject) => {
      fetchRetryClient.exponentialBackoff(url, requestOptions, { maxRetries: (this.httpOptions && this.httpOptions.retries) || 0, initialDelayInMillis: 1000 })
        .then((response) => {
          if (!response.ok) {
            sdkDetails.requestId = response.headers.get('x-request-id')
            throw Error(reduceError(response))
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
    return EVENTS_BASE_URL + path
  }
}

module.exports = {
  init: init
}
