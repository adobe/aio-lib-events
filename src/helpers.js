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
const querystring = require('querystring')
const httplinkheader = require('http-link-header')
const url = require('url')
const JSONbig = require('json-bigint')
const loggerNamespace = '@adobe/aio-lib-events'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace,
  { level: process.env.LOG_LEVEL })

/**
 * Reduce an Error to a string
 *
 * @param {object} error Error object
 * @returns {object} custom error string
 */
function reduceError (error = {}) {
  const response = error
  if (response.status && response.statusText && response.url) {
    return `${response.status} - ${response.statusText} (${response.url})`
  }
  return error
}

/**
 * Appends querystring key/value pairs to a url
 *
 * @param {string} url URL
 * @param {object} qs Object/map with all the query paratemers as key value pairs
 * @returns {string} URL with appended querystring key/value pairs
 */
function appendQueryParams (url, qs) {
  let result = url
  if (qs) {
    let separator = (url.indexOf('?') >= 0) ? '&' : '?'
    for (const key of Object.getOwnPropertyNames(qs)) {
      if (qs[key]) {
        const escKey = querystring.escape(key)
        const escValue = querystring.escape(qs[key])
        result += `${separator}${escKey}=${escValue}`
        separator = '&'
      }
    }
  }
  return result
}

/**
 * Parse the Link header
 * Spec: @{link https://tools.ietf.org/html/rfc5988#section-5}
 *
 * @param {string|URL} base URL used to resolve relative uris
 * @param {string} header Link header value
 * @returns {object} Parsed link header
 */
function parseLinkHeader (base, header) {
  const result = {}
  const links = httplinkheader.parse(header)
  for (const link of links.refs) {
    result[link.rel] = new url.URL(link.uri, base).href
  }
  return result
}

/**
 * Parse the Retry-After header
 * Spec: {@link https://tools.ietf.org/html/rfc7231#section-7.1.3}
 *
 * @param {string} header Retry-After header value
 * @returns {number} Number of milliseconds to sleep until the next call to getEventsFromJournal
 */
function parseRetryAfterHeader (header) {
  if (header.match(/^[0-9]+$/)) {
    return parseInt(header, 10) * 1000
  } else {
    return Date.parse(header) - Date.now()
  }
}

/**
 * Wrapper to check the event received by webhook
 * and return decoded (if encoded) and properly parsed payload
 *
 * @param {*} event event payload received by webhook
 * @returns {object} decoded and properly parsed payload json object
 */
function getProperPayload (event) {
  let decodedJsonPayload
  try {
    if (isBase64Encoded(event)) {
      decodedJsonPayload = JSONbig.parse(Buffer.from(event, 'base64').toString('utf-8'))
    } else {
      // parsing for non-encoded json payloads (e.g. custom events)
      decodedJsonPayload = JSONbig.parse(event)
    }
  } catch (error) {
    logger.error('error occured while checking payload' + error.message)
    return genErrorResponse(400, 'Failed to understand the payload')
  }
  return decodedJsonPayload
}

/**
 * Checks for the payload type if it is base64 encode or not
 *
 * @param {*} eventPayload - the event payload received by the consumer webhook
 * @returns {boolean} true if encoded or false
 */
function isBase64Encoded (eventPayload) {
  return Buffer.from(eventPayload, 'base64').toString('base64') === eventPayload
}

/**
 * Generates generic error json response object based on HTTP error codes and message
 *
 * @param {*} statusCode HTTP error codes
 * @param {*} message custom error message
 * @returns {object} error response json object
 */
function genErrorResponse (statusCode, message) {
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

const exportFunctions = {
  reduceError,
  appendQueryParams,
  parseLinkHeader,
  parseRetryAfterHeader,
  getProperPayload,
  genErrorResponse
}

module.exports = {
  exportFunctions
}
