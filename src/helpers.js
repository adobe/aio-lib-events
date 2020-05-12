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
 **/
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

module.exports = {
  reduceError,
  appendQueryParams,
  parseLinkHeader,
  parseRetryAfterHeader
}
