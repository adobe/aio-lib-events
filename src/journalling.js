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
'use strict'

const helpers = require('./helpers')
const DEFAULT_INTERVAL = 2000
const Rx = require('rxjs')

/* global EventsCoreAPI, EventsJournalOptions, EventsJournalPollingOptions, Observer, Subscription */ // for linter

class EventsConsumerFromJournal extends Rx.Subject {
  /**
   * Construct and start an Adobe I/O event emitter.
   *
   * @param {EventsCoreAPI} ioEvents AdobeIOEvents instance
   * @param {string} journalUrl Complete URL of the journal
   * @param {EventsJournalOptions} [eventsJournalOptions] Query options to send with the Journal URL
   * @param {EventsJournalPollingOptions} [eventsJournalPollingOptions] Journal polling options
   */
  constructor (ioEvents, journalUrl, eventsJournalOptions, eventsJournalPollingOptions) {
    super()
    this.ioEvents = ioEvents
    this.journalUrl = helpers.exportFunctions.appendQueryParams(journalUrl, eventsJournalOptions)
    this.nextLink = this.journalUrl
    this.interval = eventsJournalPollingOptions && eventsJournalPollingOptions.interval
    this.subject = new Rx.Subject()
    this.timeout = setTimeout(() => this.__checkPollingCondition(), 0, this)
  }

  /**
   * Poll for more events only if number of subscribers is > 0
   *
   * @private
   */
  __checkPollingCondition () {
    if (this.subject.observers.length > 0) {
      setTimeout(() => this.poll(), 0, this)
    } else {
      setTimeout(() => this.__checkPollingCondition(), DEFAULT_INTERVAL, this)
    }
  }

  /**
   *
   * Overrides the subscribe of the Observable.
   * On subscribing to the observable, we to subscribe to the subject
   *
   * @param {Observer} observer to the events arising from polling the journal
   * @returns {Subscription} Returns a subscription to the subject
   */
  subscribe (observer) {
    return this.subject.subscribe(observer)
  }

  /**
   * Poll for new events
   *
   * @private
   */
  poll () {
    this.ioEvents.getEventsFromJournal(this.nextLink)
      .then(response => {
        this.nextLink = response && response.link.next
        let timeout = 0
        if (response && response.events) {
          // emit each event, issue another poll() immediately
          // since more events may be pending
          for (const event of response.events) {
            this.subject.next(event)
          }
        } else {
          // no events, wait to requested amount of time
          timeout = this.interval || (response && response.retryAfter) || DEFAULT_INTERVAL
        }
        // initiate
        this.timeout = timeout
        setTimeout(() => this.__checkPollingCondition(), this.timeout, this)
      }).catch(err => {
        this.subject.error(err)
        setTimeout(() => this.__checkPollingCondition(), DEFAULT_INTERVAL, this)
      })
  }
}

module.exports = EventsConsumerFromJournal
