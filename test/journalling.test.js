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

const sdk = require('../src')
const mock = require('./mock')
const EventsConsumerFromJournal = require('../src/journalling')
const Rx = require('rxjs')
const { codes } = require('../src/SDKErrors')

// /////////////////////////////////////////////
const gImsOrgId = 'test-org'
const gApiKey = 'test-apikey'
const gAccessToken = 'test-token'

const journallingUrl = 'http://journal-url/events/organizations/orgId/integrations/integId/regId1'
const options = { limit: 1, latest: false }

// /////////////////////////////////////////////

const createSdkClient = async () => {
  const eventsClient = await sdk.init(gImsOrgId, gApiKey, gAccessToken)
  return eventsClient
}

// /////////////////////////////////////////////

beforeEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})

// /////////////////////////////////////////////

describe('Create object of EventsConsumerFromJournal', () => {
  it('Creating object of EventsConsumerFromJournal should return an observable', async () => {
    const eventsClient = createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient,
      journallingUrl, options)
    expect(journalling instanceof Rx.Subject).toBe(true)
    expect(journalling.observers.length).toBe(0)
  })
})

describe('Subscribing and unsubscribing to journal', () => {
  test('Test subscribing and unsubscribing to journal ', async () => {
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient,
      journallingUrl, options)
    const journallingObservable = journalling.asObservable()
    expect(journalling.subject.observers.length).toBe(0)
    const subscription = journallingObservable.subscribe({
      next: (v) => console.log('Observer A: ' + JSON.stringify(v.position)),
      error: (e) => console.log(e),
      complete: () => console.log('Observer A is complete')
    })
    expect(journalling.subject.observers.length).toBe(1)
    subscription.unsubscribe()
    expect(journalling.subject.observers.length).toBe(0)
  })
})

describe('Polling for journal events', () => {
  it('Test polling journal once with events ', async () => {
    jest.useFakeTimers()
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient,
      journallingUrl)
    jest.spyOn(journalling, '__checkPollingCondition')
    const journallingObservable = journalling.asObservable()
    eventsClient.getEventsFromJournal = getMockImplementation(
      mock.data.journalPollerResponse)
    journallingObservable.subscribe(v => {
      expect(v.position).toBe('position-2')
    })
    jest.advanceTimersByTime(0)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    jest.advanceTimersByTime(0)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(0)
    jest.clearAllTimers()
  })

  it('Test polling journal once with error on poll ', async () => {
    jest.useFakeTimers()
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient, journallingUrl, options)
    jest.spyOn(journalling, '__checkPollingCondition')
    const journallingObservable = journalling.asObservable()
    eventsClient.getEventsFromJournal = getMockErrorResponse()
    journallingObservable.subscribe(v => {},
      error => {
        expect(error.code).toBe('ERROR_GET_JOURNAL_DATA')
      })
    jest.advanceTimersByTime(0)
    expect(journalling.subject.observers.length).toBe(1)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(0)
    await Promise.resolve()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    expect(journalling.subject.observers.length).toBe(0)
    jest.advanceTimersByTime(2000)
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(2000)
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(3)
    jest.clearAllTimers()
    eventsClient.getEventsFromJournal.mockRestore()
  })

  it(' Test polling journal twice no content ', async () => {
    jest.useFakeTimers()
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient, journallingUrl, options)
    jest.spyOn(journalling, '__checkPollingCondition')
    const journallingObservable = journalling.asObservable()
    eventsClient.getEventsFromJournal = getMockImplementation(mock.data.journalPollerNoContentResponse)
    journallingObservable.subscribe()
    jest.advanceTimersByTime(0)
    expect(journalling.__checkPollingCondition).toBeCalled()
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toBeCalled()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    jest.advanceTimersByTime(10000)
    expect(journalling.__checkPollingCondition).toBeCalled()
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toBeCalled()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(2)
    jest.clearAllTimers()
    eventsClient.getEventsFromJournal.mockRestore()
  })
  it(' Test polling journal twice no content and default timeout ', async () => {
    jest.useFakeTimers()
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient, journallingUrl)
    jest.spyOn(journalling, '__checkPollingCondition')
    const journallingObservable = journalling.asObservable()
    eventsClient.getEventsFromJournal =
        getMockImplementation(mock.data.journalPollerNoContentMissingRetryAfter)
    journallingObservable.subscribe()
    jest.advanceTimersByTime(0)
    expect(journalling.__checkPollingCondition).toBeCalled()
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toBeCalled()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    jest.advanceTimersByTime(2000)
    expect(journalling.__checkPollingCondition).toBeCalled()
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toBeCalled()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(2)
    jest.clearAllTimers()
    eventsClient.getEventsFromJournal.mockRestore()
  })

  it(' Test polling journal twice no content and custom timeout ', async () => {
    jest.useFakeTimers()
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient, journallingUrl, {}, { interval: 20000 })
    jest.spyOn(journalling, '__checkPollingCondition')
    const journallingObservable = journalling.asObservable()
    eventsClient.getEventsFromJournal =
        getMockImplementation(mock.data.journalPollerNoContentResponse)
    journallingObservable.subscribe()
    jest.advanceTimersByTime(0)
    expect(journalling.__checkPollingCondition).toBeCalled()
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toBeCalled()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(1)
    await Promise.resolve()
    jest.advanceTimersByTime(10000)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(10000)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(0)
    expect(eventsClient.getEventsFromJournal).toBeCalled()
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(2)
    jest.clearAllTimers()
    eventsClient.getEventsFromJournal.mockRestore()
  })
})

describe('No subscribers to journalling', () => {
  it(' Test no subscribers ', async () => {
    jest.useFakeTimers()
    const eventsClient = await createSdkClient()
    const journalling = new EventsConsumerFromJournal(eventsClient, journallingUrl, options)
    jest.spyOn(journalling, '__checkPollingCondition')
    eventsClient.getEventsFromJournal = getMockImplementation(mock.data.journalPollerNoContentResponse)
    jest.advanceTimersByTime(0)
    expect(journalling.__checkPollingCondition).toBeCalled()
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(2000)
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(0)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(2000)
    expect(eventsClient.getEventsFromJournal).toHaveBeenCalledTimes(0)
    expect(journalling.__checkPollingCondition).toHaveBeenCalledTimes(3)
    jest.clearAllTimers()
    eventsClient.getEventsFromJournal.mockRestore()
  })
})

/**
 * Mock implementation of get events from journal that returns a mock value
 *
 * @param mockResponse
 */
function getMockImplementation (mockResponse) {
  return jest.fn().mockImplementation(function (journalUrl, options) {
    return new Promise((resolve) => {
      resolve(mockResponse)
    })
  })
}

/**
 * Mock implementation of a function that returns an error
 */
function getMockErrorResponse () {
  return jest.fn().mockImplementation(function () {
    return new Promise((resolve, reject) => {
      reject(
        new codes.ERROR_GET_JOURNAL_DATA({
          undefined,
          messageValues: new Error('get journal events failed with 500 Internal Server Error')
        }))
    })
  })
}
