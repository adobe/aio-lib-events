/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const providerResponse = {
  _links: {
    'rel:eventmetadata': {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata'
    },
    'rel:update': {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id'
    },
    self: {
      href: 'https://api.adobe.io/events/providers/test-id'
    }
  },
  id: 'test-id',
  label: 'Test provider',
  description: 'A custom events provider',
  source: 'urn:uuid:test-id',
  publisher: 'testOrg@AdobeOrg'
}

const providerWithEventMetadataResponse = {
  _links: {
    'rel:eventmetadata': {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata'
    },
    'rel:update': {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id'
    },
    self: {
      href: 'https://api.adobe.io/events/providers/test-id?eventmetadata=true'
    }
  },
  _embedded: {
    eventmetadata: [
      {
        _links: {
          'rel:sample_event': {
            href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.events.sdk.event.test/sample_event'
          },
          'rel:update': {
            href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id/eventmetadata/com.adobe.events.sdk.event.test'
          },
          self: {
            href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.events.sdk.event.test'
          }
        },
        description: 'Test for Events SDK',
        label: 'EventsSDK test',
        event_code: 'com.adobe.events.sdk.event.test'
      }
    ]
  },
  id: 'test-id',
  label: 'Test provider',
  description: 'A custom events provider',
  source: 'urn:uuid:test-id',
  publisher: 'testOrg@AdobeOrg'
}

const getAllProvidersResponse = {
  _links: {
    self: {
      href: 'https://api.adobe.io/events/consumerOrgId/providers'
    }
  },
  _embedded: {
    providers: [
      {
        _links: {
          'rel:eventmetadata': {
            href: 'https://api.adobe.io/events/providers/test-id-1/eventmetadata'
          },
          'rel:update': {
            href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id-1'
          },
          self: {
            href: 'https://api.adobe.io/events/providers/test-id-1'
          }
        },
        id: 'test-id-1',
        label: 'label 1',
        source: 'urn:uuid:source1',
        publisher: 'Adobe'
      },
      {
        _links: {
          'rel:eventmetadata': {
            href: 'https://api.adobe.io/events/providers/test-id-2/eventmetadata'
          },
          'rel:update': {
            href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id-2'
          },
          self: {
            href: 'https://api.adobe.io/events/providers/test-id-2'
          }
        },
        id: 'test-id-2',
        label: 'label 2',
        source: 'urn:uuid:source2',
        publisher: 'adobeOrg2@AdobeOrg'
      }
    ]
  }
}

const createProvider = {
  label: 'Test provider',
  docs_url: 'https://test-docs.com',
  description: 'desc'
}

const createProviderBadRequest = {
  docs_url: 'https://test-docs.com',
  description: 'desc'
}

const updateProvider = {
  label: 'Test provider 2',
  docs_url: 'https://test-docs-2.com',
  description: 'desc'
}

const updateProviderBadRequest = {
  docs_url: 'https://test-docs-2.com',
  description: 'desc'
}

const updateProviderResponse = {
  _links: {
    'rel:eventmetadata': {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata'
    },
    'rel:update': {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id'
    },
    self: {
      href: 'https://api.adobe.io/events/providers/test-id'
    }
  },
  id: 'test-id',
  label: 'Test provider 2',
  description: 'desc',
  source: 'urn:uuid:test-id',
  docs_url: 'https://test-docs-2.com',
  publisher: 'testOrg@AdobeOrg'
}

const createEventMetadataForProvider = {
  label: 'test event code 1',
  description: 'Test for SDK 1',
  event_code: 'com.adobe.event_code_1'
}

const createEventMetadataForProviderResponse = {
  _links: {
    'rel:sample_event': {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_1/sample_event'
    },
    'rel:update': {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id/eventmetadata/com.adobe.event_code_1'
    },
    self: {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_1'
    }
  },
  label: 'test event code 1',
  description: 'Test for SDK 1',
  event_code: 'com.adobe.event_code_1'
}

const getAllEventMetadataResponse = {
  _links: {
    self: {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata'
    }
  },
  _embedded: {
    eventmetadata: [
      {
        _links: {
          'rel:sample_event': {
            href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_1/sample_event'
          },
          'rel:update': {
            href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id/eventmetadata/com.adobe.event_code_1'
          },
          self: {
            href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_1'
          }
        },
        description: 'Test for SDK custom',
        label: 'test event code custom',
        event_code: 'com.adobe.event_code_1'
      },
      {
        _links: {
          'rel:sample_event': {
            href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_2/sample_event'
          },
          'rel:update': {
            href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id/eventmetadata/com.adobe.event_code_2'
          },
          self: {
            href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_2'
          }
        },
        description: 'Test for SDK custom 2',
        label: 'test event code custom 2',
        event_code: 'com.adobe.event_code_2'
      }
    ]
  }
}

const getEventMetadataResponse = {
  _links: {
    'rel:sample_event': {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_1/sample_event'
    },
    'rel:update': {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/providers/test-id/eventmetadata/com.adobe.event_code_1'
    },
    self: {
      href: 'https://api.adobe.io/events/providers/test-id/eventmetadata/com.adobe.event_code_1'
    }
  },
  description: 'Test for SDK 1',
  label: 'test event code 1',
  event_code: 'com.adobe.event_code_1'
}

const createEventMetadataBadRequest =
{
  label: 'test event code 1',
  description: 'Test for SDK 1'
}

const createWebhookRegistration =
{
  name: 'name',
  description: 'description',
  client_id: 'test-apikey',
  webhook_url: 'https://test-webhook',
  delivery_type: 'WEBHOOK',
  events_of_interest: [
    {
      event_code: 'event_code_1',
      provider: 'provider_1'
    }
  ]
}

const createWebhookRegistrationBadRequest =
{
  name: 'name',
  description: 'description',
  client_id: 'test-apikey',
  delivery_type: 'WEBHOOK',
  events_of_interest: [
    {
      event_code: 'event_code_1',
      provider: 'provider_1'
    }
  ]
}

const createWebhookRegistrationResponse = {
  id: 248723,
  name: 'name',
  description: 'description',
  client_id: 'test-apikey',
  parent_client_id: 'test-apikey',
  webhook_url: 'https://test-webhook',
  status: 'VERIFIED',
  type: 'APP',
  integration_status: 'ENABLED',
  events_of_interest: [
    {
      event_code: 'event_code_1',
      event_label: 'event_label',
      event_description: 'event_description',
      provider_id: 'provider_id',
      provider: 'provider_1',
      provider_label: 'label',
      event_delivery_format: 'cloud_events'
    }
  ],
  registration_id: 'registration_id',
  delivery_type: 'WEBHOOK',
  events_url: 'journal_url',
  created_date: '2020-02-21T08:45:16.446Z',
  updated_date: '2020-02-21T08:45:16.446Z',
  runtime_action: ''
}

const getAllWebhookRegistrationsResponse = [
  {
    id: 1,
    name: 'name',
    description: 'description',
    client_id: 'test-apikey',
    parent_client_id: 'test-apikey',
    webhook_url: 'https://test-webhook',
    status: 'VERIFIED',
    type: 'APP',
    integration_status: 'ENABLED',
    events_of_interest: [
      {
        event_code: 'event_code_1',
        event_label: 'event_label',
        event_description: 'event_description',
        provider_id: 'provider_id',
        provider: 'provider_1',
        provider_label: 'label',
        event_delivery_format: 'cloud_events'
      }
    ],
    registration_id: 'registration_id',
    delivery_type: 'WEBHOOK',
    events_url: 'journal_url',
    created_date: '2020-02-21T08:45:16.446Z',
    updated_date: '2020-02-21T08:45:16.446Z',
    runtime_action: ''
  },
  {
    id: 2,
    name: 'name 2',
    description: 'description 2',
    client_id: 'test-apikey',
    parent_client_id: 'test-apikey',
    webhook_url: 'https://test-webhook-2',
    status: 'VERIFIED',
    type: 'APP',
    integration_status: 'ENABLED',
    events_of_interest: [
      {
        event_code: 'event_code_2',
        event_label: 'event_label 2',
        event_description: 'event_description 2',
        provider_id: 'provider_id',
        provider: 'provider_1',
        provider_label: 'label 2',
        event_delivery_format: 'cloud_events'
      }
    ],
    registration_id: 'registration_id_2',
    delivery_type: 'WEBHOOK',
    events_url: 'journal_url_2',
    created_date: '2020-02-21T08:45:16.446Z',
    updated_date: '2020-02-21T08:45:16.446Z',
    runtime_action: ''
  }
]

const cloudEvent = {
  id: 'test-id',
  source: 'urn:uuid:test-provider-id',
  type: 'com.adobe.testevent',
  data: {
    hello: 'world'
  }
}

const cloudEventEmptyPayload = {
  id: 'test-id',
  source: 'urn:uuid:test-provider-id',
  type: 'com.adobe.testevent'
}

const journalResponseBody = {
  events: [
    {
      position: 'position-2',
      event: {
        header: {
          msgType: 'xdmEntityProjectionEvent',
          msgId: 'msdId',
          msgVersion: '1.0.0',
          xactionId: 'action-id',
          createdAt: 1545303830289,
          originalTimestamp: 1545303830046,
          imsOrgId: 'test-org',
          xdmSchema: {
            name: '_xdm.context.profile',
            version: '0.9.9.7'
          },
          _adobeio: {
            eventCode: 'test-event-code',
            imsOrgId: 'test-org',
            providerMetadata: 'test-pm'
          }
        },
        body: {
          hello: 'world'
        }
      }
    }
  ],
  _page: {
    last: 'position-1',
    count: 1
  }
}

const journalResponseHeader200 = {
  status: 200,
  headers: {
    link: [
      '</events/organizations/orgId/integrations/integId/regId>; rel="events"',
      '</events-fast/organizations/orgId/integrations/integId/regId?since=position-1>; rel="next"',
      '</count/organizations/orgId/integrations/integId/regId?since=position-1>; rel="count"',
      '</events/organizations/orgId/integrations/integId/regId?latest=true>; rel="latest"',
      '</events/organizations/orgId/integrations/integId/regId?since={position}&limit={count}>; rel="page"',
      '</events/organizations/orgId/integrations/integId/regId?seek={duration}&limit={count}>; rel="seek"',
      '</events-validate/organizations/orgId/integrations/integId/regId?since=position-1>; rel="validate"'
    ]
  }
}

const journalResponseHeader204 = {
  status: 204,
  headers: {
    link: [
      '</events/organizations/orgId/integrations/integId/regId>; rel="events"',
      '</events-fast/organizations/orgId/integrations/integId/regId?since=position-1>; rel="next"',
      '</count/organizations/orgId/integrations/integId/regId?since=position-1>; rel="count"',
      '</events/organizations/orgId/integrations/integId/regId?latest=true>; rel="latest"',
      '</events/organizations/orgId/integrations/integId/regId?since={position}&limit={count}>; rel="page"',
      '</events/organizations/orgId/integrations/integId/regId?seek={duration}&limit={count}>; rel="seek"',
      '</events-validate/organizations/orgId/integrations/integId/regId?since=position-1>; rel="validate"'
    ],
    'retry-after': 10
  }
}

const journalResponseHeader204MissingLinks = {
  status: 204,
  headers: {
    'retry-after': 10
  }
}

const journalResponseHeader204DateTime = {
  status: 204,
  headers: {
    link: [
      '</events/organizations/orgId/integrations/integId/regId>; rel="events"',
      '</events-fast/organizations/orgId/integrations/integId/regId?since=position-1>; rel="next"',
      '</count/organizations/orgId/integrations/integId/regId?since=position-1>; rel="count"',
      '</events/organizations/orgId/integrations/integId/regId?latest=true>; rel="latest"',
      '</events/organizations/orgId/integrations/integId/regId?since={position}&limit={count}>; rel="page"',
      '</events/organizations/orgId/integrations/integId/regId?seek={duration}&limit={count}>; rel="seek"',
      '</events-validate/organizations/orgId/integrations/integId/regId?since=position-1>; rel="validate"'
    ],
    'retry-after': '01 Jan 1970 00:00:10 GMT'
  }
}

const journalPollerResponse = {
  events: [
    {
      position: 'position-2',
      event: {
        header: {
          msgType: 'xdmEntityProjectionEvent',
          msgId: 'msdId',
          msgVersion: '1.0.0',
          xactionId: 'action-id',
          createdAt: 1545303830289,
          originalTimestamp: 1545303830046,
          imsOrgId: 'test-org',
          xdmSchema: {
            name: '_xdm.context.profile',
            version: '0.9.9.7'
          },
          _adobeio: {
            eventCode: 'test-event-code',
            imsOrgId: 'test-org',
            providerMetadata: 'test-pm'
          }
        },
        body: {
          hello: 'world'
        }
      }
    }
  ],
  _page: {
    last: 'position-1',
    count: 1
  },
  link: {
    events: 'http://journal-url/events/organizations/orgId/integrations/integId/regId',
    next: 'http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1',
    count: 'http://journal-url/count/organizations/orgId/integrations/integId/regId?since=position-1',
    latest: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?latest=true',
    page: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?since={position}&limit={count}',
    seek: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?seek={duration}&limit={count}',
    validate: 'http://journal-url/events-validate/organizations/orgId/integrations/integId/regId?since=position-1'
  }
}

const journalPollerNoContentResponse = {
  link: {
    events: 'http://journal-url/events/organizations/orgId/integrations/integId/regId',
    next: 'http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1',
    count: 'http://journal-url/count/organizations/orgId/integrations/integId/regId?since=position-1',
    latest: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?latest=true',
    page: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?since={position}&limit={count}',
    seek: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?seek={duration}&limit={count}',
    validate: 'http://journal-url/events-validate/organizations/orgId/integrations/integId/regId?since=position-1'
  },
  retryAfter: 10000
}

const journalPollerNoContentMissingRetryAfter = {
  link: {
    events: 'http://journal-url/events/organizations/orgId/integrations/integId/regId',
    next: 'http://journal-url/events-fast/organizations/orgId/integrations/integId/regId?since=position-1',
    count: 'http://journal-url/count/organizations/orgId/integrations/integId/regId?since=position-1',
    latest: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?latest=true',
    page: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?since={position}&limit={count}',
    seek: 'http://journal-url/events/organizations/orgId/integrations/integId/regId?seek={duration}&limit={count}',
    validate: 'http://journal-url/events-validate/organizations/orgId/integrations/integId/regId?since=position-1'
  }
}

const data = {
  providerResponse: providerResponse,
  providerWithEventMetadataResponse: providerWithEventMetadataResponse,
  getAllProvidersResponse: getAllProvidersResponse,
  createProvider: createProvider,
  createProviderBadRequest: createProviderBadRequest,
  updateProvider: updateProvider,
  updateProviderBadRequest: updateProviderBadRequest,
  updateProviderResponse: updateProviderResponse,
  getAllEventMetadataResponse: getAllEventMetadataResponse,
  getEventMetadataResponse: getEventMetadataResponse,
  createEventMetadataForProvider: createEventMetadataForProvider,
  createEventMetadataForProviderResponse: createEventMetadataForProviderResponse,
  createEventMetadataBadRequest: createEventMetadataBadRequest,
  createWebhookRegistration: createWebhookRegistration,
  createWebhookRegistrationResponse: createWebhookRegistrationResponse,
  createWebhookRegistrationBadRequest: createWebhookRegistrationBadRequest,
  getAllWebhookRegistrationsResponse: getAllWebhookRegistrationsResponse,
  cloudEvent: cloudEvent,
  cloudEventEmptyPayload: cloudEventEmptyPayload,
  journalResponseBody: journalResponseBody,
  journalResponseHeader200: journalResponseHeader200,
  journalResponseHeader204: journalResponseHeader204,
  journalResponseHeader204MissingLinks: journalResponseHeader204MissingLinks,
  journalResponseHeader204DateTime: journalResponseHeader204DateTime,
  journalPollerResponse: journalPollerResponse,
  journalPollerNoContentResponse: journalPollerNoContentResponse,
  journalPollerNoContentMissingRetryAfter: journalPollerNoContentMissingRetryAfter
}

module.exports = {
  data: data
}
