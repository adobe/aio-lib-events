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
 * @param {object} qs Object/map with all the query parameters as key value pairs
 * @returns {string} URL with appended querystring key/value pairs
 */
function appendQueryParams (url, qs) {
  let result = url
  if (qs && !(Object.keys(qs).length === 0)) {
    const filteredQs = Object.entries(qs).filter(([k, v]) => !(v === null || v === undefined))
    if (Object.keys(filteredQs).length === 0) {
      return result
    }
    const separator = (url.indexOf('?') >= 0) ? '&' : '?'
    const queryParams = querystring.stringify(Object.fromEntries(filteredQs))
    result += `${separator}${queryParams}`
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
 * and return decoded (if encoded) payload
 *
 * @param {*} event event payload received by webhook
 * @returns {object} decoded/same raw event payload
 */
function getProperPayload (event) {
  if (isBase64Encoded(event)) {
    return Buffer.from(event, 'base64').toString('utf-8')
  }
  // returning the non-encoded json payloads (e.g. custom events) as is
  return event
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
    statusCode,
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
