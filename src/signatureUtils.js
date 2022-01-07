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

const stateLib = require('@adobe/aio-lib-state')
const fetch = require('node-fetch')
const crypto = require('crypto')
const loggerNamespace = '@adobe/aio-lib-events'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace,
    { level: process.env.LOG_LEVEL })

/**
* Wrapper to check the event received by webhook
* and return decoded (if encoded) and properly parsed payload
* @param {*} event event payload received by webhook
* @returns decoded and properly parsed payload
*/
function getProperPayload(event) {
    let decodedJsonPayload
    try {
        if (isBase64Encoded(event)) {
            decodedJsonPayload = JSON.parse(Buffer.from(event, 'base64').toString('utf-8'))
        } else {
            // parsing for non-encoded json payloads (e.g. custom events)
            decodedJsonPayload = JSON.parse(event)
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
function isBase64Encoded(eventPayload) {
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
async function verifyDigitalSignature(digiSignature1, digiSignature2, pubKeyUrl1, pubKeyUrl2, recipientClientId, signedPayload) {
    let pubKey1Pem, pubKey2Pem
    try {
        const state = await stateLib.init()
        pubKey1Pem = await fetchFromCacheOrApi(pubKeyUrl1, state)
        pubKey2Pem = await fetchFromCacheOrApi(pubKeyUrl2, state)
    } catch (error) {
        logger.error('error occurred while fetching from the public key url %s or %s for client %s due to %s',
            pubKeyUrl1, pubKeyUrl2, recipientClientId, error.message)
        return genErrorResponse(500, 'Error occurred while fetching Public Key')
    }
    var signatures = [digiSignature1, digiSignature2] 
    var keys = [pubKey1Pem, pubKey2Pem] 
    return await verifySignatureHelper(signatures, signedPayload, keys, recipientClientId)
}

/**
 * Wrapper to fetch the key from aio-lib-state, if not present fetch using
 * the cloud front url and set in aio-lib-state 
 * 
 * @param {*} pubKeyUrl cloud front url of format https://d2wbnl47xxxxx.cloudfront.net/pub-key-1.pem
 * @param {*} state aio-lib-state client
 * @returns public key
 */
async function fetchFromCacheOrApi(pubKeyUrl, state) {
    var publicKey
    let publicKeyFileName
    try {
        // public key url is the cloud front url in this format https://d2wbnl47xxxxx.cloudfront.net/pub-key-1.pem
        publicKeyFileName = pubKeyUrl.substring(pubKeyUrl.lastIndexOf('/') + 1)
        publicKey = await state.get(publicKeyFileName)
    } catch (error) {
        logger.error('error fetching from aio lib state due to => %s', error.message)
        throw error
    }

    if (publicKey) {
        return publicKey
    }

    logger.info('public key for url %s not present in aio state lib cache, fetching from api..', pubKeyUrl)
    // fetch from api and set in cache default expiry 24h
    publicKey = await fetchPublicKeyFromCloudFront(pubKeyUrl)
    await state.put(publicKeyFileName, publicKey)
    return publicKey
}

/**
 * Fetches public key using the cloud front public key url
 * 
 * @param {*} publicKeyUrl - cloud front public key url of format 
 * https://d2wbnl47xxxxx.cloudfront.net/pub-key-1.pem
 * @returns public key
 */
async function fetchPublicKeyFromCloudFront(publicKeyUrl) {
    var pubKey
    await fetch(publicKeyUrl)
        .then(response => response.text())
        .then(text => {
            logger.info('successfully fetched the public key %s from cloud front url %s', text, publicKeyUrl)
            pubKey = text
        })
        .catch(err => {
            logger.error('error fetching the public key from cloud front url %s due to => %s', publicKeyUrl, err.message)
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
async function verifySignatureHelper(digitalSignatures, signedPayload, publicKeys, recipientClientId) {
    let result, publicKey
    try {
        for (i = 0; i < digitalSignatures.length; i++) { 
            publicKey = await createCryptoPublicKey(publicKeys[i])
            result = await cryptoVerify(digitalSignatures[i], publicKey, signedPayload)
            if (result) {
                break;
                //return result1
            }
        }
        return result
    } catch (error) {
        logger.error('error occured while verifying digital signature for client id %s due to %s ', recipientClientId, error.message)
        return genErrorResponse(500, 'error occured while verifying digital signature')
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
async function cryptoVerify(signature, pubKey, signedPayload) {
    try {
        return crypto.verify('rsa-sha256', new TextEncoder().encode(signedPayload), pubKey, Buffer.from(signature, 'base64'))
    } catch (error) {
        logger.error('error during crypto verification of digital signature due to => ' + error.message)
        return false
    }
}

async function createCryptoPublicKey(publicKey) {
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
function isTargetRecipient(decodedJsonPayload, recipientClientId) {
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
function genErrorResponse(statusCode, message) {
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

module.exports = {
    verifyDigitalSignature,
    isTargetRecipient,
    genErrorResponse,
    getProperPayload
}
