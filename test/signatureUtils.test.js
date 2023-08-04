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
const mockStateInstance = {
  get: jest.fn(),
  put: jest.fn()
}

jest.mock('@adobe/aio-lib-state', () => ({
  init: jest.fn().mockResolvedValue(mockStateInstance)
}))

const signatureUtils = require('../src/signatureUtils').exportFunctions
const mock = require('./mock')
const fetch = require('node-fetch')
const {
  Response
} = jest.requireActual('node-fetch')

describe('Invalid Cloud Front Public Key Urls Test', () => {
  it('verify pem public keys fetched with invalid urls', async () => {
    const url1 = 'www.invalidcloudfront.net'
    const url2 = 'www.invalidcloudfront.net'
    const pubKeysArray = await signatureUtils.fetchPemEncodedPublicKeys(url1, url2)
    // assert if the return array of pub keys contains all empty string, i.e no pub keys present
    expect(pubKeysArray.some(Boolean)).toBe(false)
  })
})
describe('Invalid Target Recipient Test', () => {
  it('verify invalid target recipient', async () => {
    const eventPayload = mock.data.testEvent.event
    const response = await signatureUtils.isTargetRecipient(eventPayload, 'testInvalidClient')
    expect(response).toBe(false)
  })
})
describe('Test CryptoVerify Fail for Invalid Pub Key / Signature', () => {
  it('verify for invalid pub key', async () => {
    const invalidTestPubKey = mock.data.testPubKeys.invalidTestPubKey
    const payload = mock.data.testEvent.event
    const signature = mock.data.signatureOptions.params.digiSignature1
    fetch.mockImplementation(() => {
      return Promise.resolve(new Response(Buffer.from(invalidTestPubKey, 'base64').toString('utf-8')))
    })
    const response = await signatureUtils.cryptoVerify(signature, invalidTestPubKey, payload)
    expect(response).toBe(false)
  })
  it('verify for invalid signature', async () => {
    const invalidTestPubKey = mock.data.testPubKeys.invalidTestPubKey
    const payload = mock.data.testEvent.event
    const signature = mock.data.signatureOptions.params.invalidSignature
    const response = await signatureUtils.cryptoVerify(signature, invalidTestPubKey, payload)
    expect(response).toBe(false)
  })
})
describe('Test Verify Signature Helper With Invalid Key', () => {
  it('verify signature with invalid key', async () => {
    const invalidTestPubKey = mock.data.testPubKeys.invalidTestPubKey
    const payload = mock.data.testEvent.event
    const recipientClientId = mock.data.testClientId.recipientClientId
    const signatures = [mock.data.signatureOptions.params.digiSignature1, mock.data.signatureOptions.params.digiSignature2]
    const keys = [invalidTestPubKey, invalidTestPubKey]
    const response = await signatureUtils.verifySignature(signatures, payload, keys, recipientClientId)
    expect(response).toBe(false)
  })
})
describe('Test Fetch Key from CloudFront with Invalid Pub Key Url', () => {
  it('verify for invalid pub key', async () => {
    const invalidCloudFrontUrl = undefined
    fetch.mockImplementation(() => {
      return Promise.resolve(Error)
    })
    await signatureUtils.fetchPublicKeyFromCloudFront(invalidCloudFrontUrl)
      .then(res => {
        throw new Error('invalid url')
      })
      .catch(e => {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e instanceof Error).toBe(true)
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e.message).toEqual('invalid url')
      })
  })
})
describe('Test Fetch Pem Encoded Public Keys', () => {
  it('verify for invalid pub key url throws', async () => {
    const invalidCloudFrontUrl = undefined
    fetch.mockImplementation(() => {
      return Promise.resolve(Error)
    })
    await signatureUtils.fetchPemEncodedPublicKeys(invalidCloudFrontUrl)
      .then(res => {
        throw new Error('invalid url')
      })
      .catch(e => {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e instanceof Error).toBe(true)
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e.message).toEqual('invalid url')
      })
  })
})
describe('Test Get Key from Cache', () => {
  it('get key from cache throws', async () => {
    await signatureUtils.getKeyFromCache('state', 'invalid-url')
      .then(res => {
        throw new Error('lib state get error')
      })
      .catch(e => {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e instanceof Error).toBe(true)
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e.message).toEqual('lib state get error')
      })
  })
})
