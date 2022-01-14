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

const helpers = require('../src/helpers')
const mock = require('./mock')

describe('Reduce error test', () => {
  it('test no args produces empty object', () => {
    expect(helpers.exportFunctions.reduceError()).toEqual({})
  })
  it('test unexpected properties returns the same error with no reduction', () => {
    const unexpectedError = { foo: 'bar' }
    expect(helpers.exportFunctions.reduceError(unexpectedError)).toEqual(unexpectedError)
  })
  it('test inadequate properties returns the same error with no reduction', () => {
    const unexpectedError2 = { foo: 'bar', response: {} }
    expect(helpers.exportFunctions.reduceError(unexpectedError2)).toEqual(unexpectedError2)
  })
  it('test expected properties returns the object reduced to a string', () => {
    const expectedError = {
      foo: 'bar',
      response: {
        status: 500,
        statusText: 'Something went gang aft agley.',
        url: 'https://test-helpers.com'
      }
    }
    expect(helpers.exportFunctions.reduceError(expectedError.response)).toEqual('500 - Something went gang aft agley. (https://test-helpers.com)')
  })
})

describe('Append query params test', () => {
  const baseUrl = 'https://base-url.adobe.io'
  it('Append query params with single key and value', () => {
    const queryParams1 = { limit: 2 }
    const url = helpers.exportFunctions.appendQueryParams(baseUrl, queryParams1)
    expect(url).toBe('https://base-url.adobe.io?limit=2')
  })
  it('Append query params with multiple key and value', () => {
    const queryParams2 = { limit: 2, latest: true }
    const url = helpers.exportFunctions.appendQueryParams(baseUrl, queryParams2)
    expect(url).toBe('https://base-url.adobe.io?limit=2&latest=true')
  })
  it('Append query params to url with existing query params', () => {
    const queryParams3 = { interval: 10 }
    const url = helpers.exportFunctions.appendQueryParams('https://base-url.adobe.io?limit=2&latest=true', queryParams3)
    expect(url).toBe('https://base-url.adobe.io?limit=2&latest=true&interval=10')
  })
})

describe('Proper Payload Test', () => {
  it('test encoded payload is valid', async () => {
    const encodedValidPayload = mock.data.testEncodedPayload.event
    const decodedJsonPayload = mock.data.testEvent.event
    const res = await helpers.exportFunctions.getProperPayload(encodedValidPayload)
    expect(JSON.stringify(res)).toEqual(decodedJsonPayload)
  })
  it('test invalid payload returns error', async () => {
    const encodedInvalidPayload = mock.data.testEncodedInvalidPayload.event
    const res = await helpers.exportFunctions.getProperPayload(encodedInvalidPayload)
    expect(res.error.statusCode).toBe(400)
  })
})
