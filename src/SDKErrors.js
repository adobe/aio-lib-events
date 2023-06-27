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

const { ErrorWrapper, createUpdater } = require('@adobe/aio-lib-core-errors').AioCoreSDKErrorWrapper

const codes = {}
const messages = new Map()

/**
 * Create an Updater for the Error wrapper
 */
const Updater = createUpdater(
  // object that stores the error classes (to be exported)
  codes,
  // Map that stores the error strings (to be exported)
  messages
)

/**
 * Provides a wrapper to easily create classes of a certain name, and values
 */
const E = ErrorWrapper(
  // The class name for your SDK Error. Your Error objects will be these objects
  'EventsSDKError',
  // The name of your SDK. This will be a property in your Error objects
  'EventsSDK',
  // the object returned from the CreateUpdater call above
  Updater
  // the base class that your Error class is extending. AioCoreSDKError is the default
  /* AioCoreSDKError, */
)

module.exports = {
  codes,
  messages
}

// Define your error codes with the wrapper
E('ERROR_SDK_INITIALIZATION', 'SDK initialization error(s). Missing arguments: %s')
E('ERROR_GET_ALL_PROVIDERS', '%s')
E('ERROR_GET_PROVIDER', '%s')
E('ERROR_CREATE_PROVIDER', '%s')
E('ERROR_UPDATE_PROVIDER', '%s')
E('ERROR_DELETE_PROVIDER', '%s')
E('ERROR_GET_ALL_PROVIDER_METADATA', '%s')
E('ERROR_GET_ALL_EVENTMETADATA', '%s')
E('ERROR_GET_EVENTMETADATA', '%s')
E('ERROR_CREATE_EVENTMETADATA', '%s')
E('ERROR_UPDATE_EVENTMETADATA', '%s')
E('ERROR_DELETE_ALL_EVENTMETADATA', '%s')
E('ERROR_DELETE_EVENTMETADATA', '%s')
E('ERROR_CREATE_REGISTRATION', '%s')
E('ERROR_UPDATE_REGISTRATION', '%s')
E('ERROR_GET_REGISTRATION', '%s')
E('ERROR_GET_ALL_REGISTRATION', '%s')
E('ERROR_GET_ALL_REGISTRATIONS_FOR_ORG', '%s')
E('ERROR_DELETE_REGISTRATION', '%s')
E('ERROR_GET_JOURNAL_DATA', '%s')
E('ERROR_PUBLISH_EVENT', '%s')
