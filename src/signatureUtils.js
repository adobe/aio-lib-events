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
const validUrl = require('valid-url')
const helpers = require('./helpers')
const stateLib = require('@adobe/aio-lib-state')
const fetch = require('node-fetch')
const crypto = require('crypto')
const loggerNamespace = '@adobe/aio-lib-events'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace,
  { level: process.env.LOG_LEVEL })
const ADOBE_IOEVENTS_SECURITY_DOMAIN = 'https://static.adobeioevents.com'

/**
 * Wrapper to fetch the public key (either through aio-lib-state or cloud front url)
 * and verify the digital signatures
 *
 * @param {*} signatureOptions map of all digital signature header values consisting fields as below
 * digiSignature1 : Value of digital signature retrieved from the x-adobe-digital-signature1 header in each POST request to webhook
 * digiSignature2 : Value of digital signature retrieved from the x-adobe-digital-signature2 header in each POST request to webhook
 * publicKeyPath1 : Relative path of ioevents public key retrieved from the x-adobe-public-key1-path header in each POST request to webhook
 * publicKeyPath2 : Relative path of ioevents public key retrieved from the x-adobe-public-key2-path header in each POST request to webhook
 * @param {*} recipientClientId - target recipient client id
 * @param {*} signedPayload - I/O Events proper signed payload
 * @returns {boolean} true if either signatures are valid or false
 */
async function verifyDigitalSignature (signatureOptions, recipientClientId, signedPayload) {
  const signatures = [signatureOptions.digiSignature1, signatureOptions.digiSignature2]
  // complete public key url is the concatenation of the fixed adobe ioevents domain and the relative path of key
  // example url format - https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
  const pubKeyUrl1 = ADOBE_IOEVENTS_SECURITY_DOMAIN + signatureOptions.publicKeyPath1
  const pubKeyUrl2 = ADOBE_IOEVENTS_SECURITY_DOMAIN + signatureOptions.publicKeyPath2
  /* istanbul ignore else */
  if (validUrl.isHttpsUri(pubKeyUrl1) && validUrl.isHttpsUri(pubKeyUrl2)) {
    const keys = await fetchPemEncodedPublicKeys(pubKeyUrl1, pubKeyUrl2)
    return await verifySignature(signatures, signedPayload, keys, recipientClientId)
  } else {
    logger.error('either or both public key urls %s and %s are not valid', pubKeyUrl1, pubKeyUrl2)
    return false
  }
}

/**
 * Feteched the pem encoded public keys either from the state lib cache or directly via cloud front url
 *
 * @param {*} pubKeyUrl1 cloud front url of format https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
 * @param {*} pubKeyUrl2 cloud front url of format https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
 * @returns {Array} of two public keys
 */
async function fetchPemEncodedPublicKeys (pubKeyUrl1, pubKeyUrl2) {
  let pubKey1Pem, pubKey2Pem
  try {
    const state = await stateLib.init()
    pubKey1Pem = await fetchPubKeyFromCacheOrApi(pubKeyUrl1, state)
    pubKey2Pem = await fetchPubKeyFromCacheOrApi(pubKeyUrl2, state)
  } catch (error) {
    logger.error('error occurred while fetching pem encoded public keys either from cache or public key urls due to %s', error.message)
    return helpers.exportFunctions.genErrorResponse(500, 'Error occurred while fetching pem encoded Public Key')
  }
  return [pubKey1Pem, pubKey2Pem]
}

/**
 * Wrapper to fetch the key from aio-lib-state, if not present fetch using
 * the cloud front url and set in aio-lib-state
 *
 * @param {*} pubKeyUrl cloud front url of format https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
 * @param {*} state aio-lib-state client
 * @returns {string} pem encoded public key as string
 */
async function fetchPubKeyFromCacheOrApi (pubKeyUrl, state) {
  const publicKeyFileName = await getPubKeyFileName(pubKeyUrl)
  const publicKey = await getKeyFromCache(state, publicKeyFileName)
  /* istanbul ignore else */
  if (!publicKey) {
    return await fetchKeyFromApiAndPutInCache(pubKeyUrl, state, publicKeyFileName)
  }
  /* istanbul ignore next */
  return publicKey.toString()
}

/**
 * Fetch using the cloud front url and set in aio-lib-state
 *
 * @param {*} pubKeyUrl cloud front url of format https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
 * @param {*} state aio-lib-state client
 * @param {*} publicKeyFileName key file name in format pub-key-<random-uuid>.pem
 * @returns {string} pem encoded public key as string
 */
async function fetchKeyFromApiAndPutInCache (pubKeyUrl, state, publicKeyFileName) {
  logger.info('public key %s not present in aio state lib cache, fetching directly from the url..', publicKeyFileName)
  // fetch from api and set in cache default expiry 24h
  const publicKey = await fetchPublicKeyFromCloudFront(pubKeyUrl)
  /**
   * key json obj stored in cache in below format
   * {
   *     "value":"pem public key",
   *     "expiration":"24h timestamp"
   * }
   */
  await state.put(publicKeyFileName, publicKey)
  return publicKey
}

/**
 * Gets the public key from cache
 *
 * @param {*} state aio state lib instance
 * @param {*} publicKeyFileNameAsKey public key file name in format pub-key-<random-uuid>.pem
 * @returns {string} public key
 */
async function getKeyFromCache (state, publicKeyFileNameAsKey) {
  try {
    const keyObj = await state.get(publicKeyFileNameAsKey)
    /**
     * key json obj fetched from cache in below format
     * {
     *     "value":"pem public key",
     *     "expiration":"24h timestamp"
     * }
     */
    return keyObj.value
  } catch (error) {
    logger.error('aio lib state get error due to => %s', error.message)
  }
  return null
}

/**
 * Parses the cloud front pub key url and returns the key file name
 *
 * @param {*} pubKeyUrl the cloud front public key url
 * @returns {string} pub key url as string
 */
async function getPubKeyFileName (pubKeyUrl) {
  // public key url is the cloud front url in this format https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
  return pubKeyUrl.substring(pubKeyUrl.lastIndexOf('/') + 1)
}

/**
 * Fetches public key using the cloud front public key url
 *
 * @param {*} publicKeyUrl - cloud front public key url of format
 * https://static.adobeioevents.com/prod/keys/pub-key-<random-uuid>.pem
 * @returns {string} public key
 */
async function fetchPublicKeyFromCloudFront (publicKeyUrl) {
  let pubKey
  await fetch(publicKeyUrl)
    .then(response => response.text())
    .then(text => {
      logger.info('successfully fetched the public key %s from cloud front url %s', text, publicKeyUrl)
      pubKey = text
    })
    .catch(error => {
      logger.error('error fetching the public key from cloud front url %s due to => %s', publicKeyUrl, error.message)
      return helpers.exportFunctions.genErrorResponse(500, error.message)
    })
  return pubKey
}

/**
 * Digital Signature Verification Helper
 *
 * @param {*} digitalSignatures - Array of both I/O Events generated digital signatures
 * @param {*} signedPayload - I/O Events proper signed payload
 * @param {*} publicKeys - Array of both I/O Events PEM encoded public keys
 * @param {*} recipientClientId - target recipient client id
 * @returns {boolean} true if either signatures are valid or false
 */
async function verifySignature (digitalSignatures, signedPayload, publicKeys, recipientClientId) {
  let result, publicKey
  try {
    for (let i = 0; i < digitalSignatures.length; i++) {
      publicKey = await createCryptoPublicKey(publicKeys[i])
      result = await cryptoVerify(digitalSignatures[i], publicKey, signedPayload)
      /* istanbul ignore else */
      if (result) {
        return result
      }
    }
  } catch (error) {
    logger.error('error occured while verifying digital signature for client id %s due to %s ', recipientClientId, error.message)
    return false
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
async function cryptoVerify (signature, pubKey, signedPayload) {
  try {
    return crypto.verify('rsa-sha256', new TextEncoder().encode(signedPayload), pubKey, Buffer.from(signature, 'base64'))
  } catch (error) {
    logger.error('error during crypto verification of digital signature due to => ' + error.message)
    return false
  }
}

/**
 * Gets the public key object from a pem encoded key
 *
 * @param {*} publicKey pem public key
 * @returns {object} returns key object containing the public key
 */
async function createCryptoPublicKey (publicKey) {
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
function isTargetRecipient (decodedJsonPayload, recipientClientId) {
  const targetRecipient = decodedJsonPayload.recipient_client_id
  if (targetRecipient !== null && typeof (targetRecipient) !== 'undefined') {
    return targetRecipient === recipientClientId
  }
  logger.error('target recipient client id is either null or missing')
  return false
}

const exportFunctions = {
  verifyDigitalSignature,
  isTargetRecipient,
  fetchPemEncodedPublicKeys,
  cryptoVerify,
  verifySignature,
  fetchPublicKeyFromCloudFront,
  fetchPubKeyFromCacheOrApi,
  getKeyFromCache
}

module.exports = {
  exportFunctions
}
