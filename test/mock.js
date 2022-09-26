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

const createEventMetadataBadRequest = {
  label: 'test event code 1',
  description: 'Test for SDK 1'
}

const createWebhookRegistration = {
  name: 'name',
  description: 'description',
  client_id: 'test-apikey',
  webhook_url: 'https://test-webhook',
  delivery_type: 'webhook',
  events_of_interest: [
    {
      event_code: 'event_code_1',
      provider_id: 'provider_id_1'
    }
  ]
}

const updateWebhookRegistration = {
  name: 'name',
  description: 'description',
  webhook_url: 'https://test-webhook',
  delivery_type: 'webhook_batch',
  events_of_interest: [
    {
      event_code: 'event_code_1',
      provider_id: 'provider_id_1'
    }
  ]
}

const createWebhookRegistrationBadRequest = {
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
  _links: {
    'rel:events': {
      href: 'https://events-va6.adobe.io/events/organizations/consumerId/integrations/integrationId/registrationId'
    },
    'rel:trace': {
      href: 'https://eventtraces-va6.adobe.io/traces/consumerId/projectId/workspaceId/registration/registrationId'
    },
    self: {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/registrations/registrationId'
    }
  },
  id: 248723,
  name: 'name',
  description: 'description',
  client_id: 'test-apikey',
  registration_id: 'registrationId',
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
  webhook_status: 'verified',
  created_date: '2022-02-21T08:45:16.446Z',
  updated_date: '2022-02-21T08:45:16.446Z',
  consumer_id: 'consumerId',
  project_id: 'projectId',
  workspace_id: 'workspaceId',
  webhook_url: 'https://test-webhook',
  delivery_type: 'webhook',
  enabled: true
}

const updateWebhookRegistrationResponse = {
  _links: {
    'rel:events': {
      href: 'https://events-va6.adobe.io/events/organizations/consumerId/integrations/integrationId/registrationId'
    },
    'rel:trace': {
      href: 'https://eventtraces-va6.adobe.io/traces/consumerId/projectId/workspaceId/registration/registrationId'
    },
    self: {
      href: 'https://api.adobe.io/events/consumerId/projectId/workspaceId/registrations/registrationId'
    }
  },
  id: 248723,
  name: 'name_updated',
  description: 'description_updated',
  client_id: 'test-apikey',
  registration_id: 'registrationId',
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
  webhook_status: 'verified',
  created_date: '2022-02-21T08:45:16.446Z',
  updated_date: '2022-02-21T08:45:16.446Z',
  consumer_id: 'consumerId',
  project_id: 'projectId',
  workspace_id: 'workspaceId',
  webhook_url: 'https://test-webhook',
  delivery_type: 'webhook_batch',
  enabled: true
}

const getAllWebhookRegistrationsResponse = {
  _links: {
    self: {
      href: 'https://api.adobe.io/consumerId/projectId/workspaceId/registrations'
    }
  },
  _embedded: {
    registrations: [
      {
        _links: {
          'rel:events': {
            href: 'https://events-stage-va6.adobe.io/events/organizations/consumerId/integrations/integrationId/registrationId1'
          },
          'rel:trace': {
            href: 'https://eventtraces-stage-va6.adobe.io/traces/consumerId/projectId/workspaceId/registration/registrationId1'
          },
          self: {
            href: 'https://api.adobe.io/consumerId/projectId/workspaceId/registrations/registrationId1'
          }
        },
        id: 30000,
        name: 'test name 1',
        description: 'test description 1',
        client_id: 'test-apikey',
        registration_id: 'registrationId1',
        events_of_interest: [
          {
            event_code: 'event_code_1',
            event_label: 'event_label',
            event_description: 'event_description',
            provider_id: 'provider_id',
            provider_label: 'label',
            event_delivery_format: 'adobe_io'
          }
        ],
        webhook_status: 'verified',
        created_date: '2022-06-13T16:31:57.000Z',
        updated_date: '2022-09-19T05:46:36.000Z',
        consumer_id: 'consumerId',
        project_id: 'projectId',
        workspace_id: 'workspaceId',
        webhook_url: 'https://test-webhook-1',
        delivery_type: 'webhook',
        enabled: true
      },
      {
        _links: {
          'rel:events': {
            href: 'https://events-stage-va6.adobe.io/events/organizations/consumerId/integrations/integrationId/registrationId2'
          },
          'rel:trace': {
            href: 'https://eventtraces-stage-va6.adobe.io/traces/consumerId/projectId/workspaceId/registration/registrationId2'
          },
          self: {
            href: 'https://csm-stage.adobe.io/consumerId/projectId/workspaceId/registrations/registrationId2'
          }
        },
        id: 30001,
        name: 'test name 2',
        description: 'test description 2',
        client_id: 'test-apikey',
        registration_id: 'registrationId2',
        events_of_interest: [
          {
            event_code: 'event_code_2',
            event_label: 'event_label_2',
            event_description: 'event_description_2',
            provider_id: 'provider_id_2',
            provider_label: 'label',
            event_delivery_format: 'adobe_io'
          }
        ],
        webhook_status: 'hook_unreachable',
        created_date: '2022-06-13T16:31:57.000Z',
        updated_date: '2022-09-19T05:46:36.000Z',
        consumer_id: 'consumerId',
        project_id: 'projectId',
        workspace_id: 'workspaceId',
        webhook_url: 'https://test-webhook-2',
        delivery_type: 'webhook_batch',
        enabled: false
      },
      {
        _links: {
          'rel:events': {
            href: 'https://events-stage-va6.adobe.io/events/organizations/consumerId/integrations/integrationId/registrationId3'
          },
          'rel:trace': {
            href: 'https://eventtraces-stage-va6.adobe.io/traces/consumerId/projectId/workspaceId/registration/registrationId3'
          },
          self: {
            href: 'https://csm-stage.adobe.io/consumerId/projectId/workspaceId/registrations/registrationId3'
          }
        },
        id: 30002,
        name: 'test name 3',
        description: 'test description 3',
        client_id: 'test-apikey',
        registration_id: 'registrationId3',
        events_of_interest: [
          {
            event_code: 'event_code_3',
            event_label: 'event_label_3',
            event_description: 'event_description_3',
            provider_id: 'provider_id_3',
            provider_label: 'label',
            event_delivery_format: 'adobe_io'
          }
        ],
        webhook_status: 'verified',
        created_date: '2022-06-13T16:31:57.000Z',
        updated_date: '2022-09-19T05:46:36.000Z',
        consumer_id: 'consumerId',
        project_id: 'projectId',
        workspace_id: 'workspaceId',
        delivery_type: 'journal',
        enabled: true
      }
    ]
  }
}

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

const signatureOptions = {
  params: {
    digiSignature1: 'Hgq9NEIAtFItHQfHYi2x94zAaHG7088PUDLdpSTdsFjLPD+IJCrKpSf4bxNeh3vHmMqj6zUVYfFEYvgI0riJNx12b3wIMHhoa/MxQGzzCcN4GnB/LVaTm9/1LZSxKpyR34FhaaYxbN3u3dSE60zk5swjzMKUFRmFiiE6k0knjcM+e0E3f1g9kFXgy/dUIOlty4SlS3hbv1UHS/BYXakH7d0lb4mrNxHIGNuIyFRmMpbZ4KyXDJo5nCQqvW0dZKAikpavf58/S8xbYyhJTImNJaUMZYQ5m8KD6H1ME48Hr3Q+Vgte9cXrTCreK1tVqCCy/ZaQGC7Z/qPOC+D849hi9g==',
    publicKeyUrl1: 'https://d2wbnl47m3ubk3.cloudfront.net/pub-key-1.pem',
    digiSignature2: 'Hgq9NEIAtFItHQfHYi2x94zAaHG7088PUDLdpSTdsFjLPD+IJCrKpSf4bxNeh3vHmMqj6zUVYfFEYvgI0riJNx12b3wIMHhoa/MxQGzzCcN4GnB/LVaTm9/1LZSxKpyR34FhaaYxbN3u3dSE60zk5swjzMKUFRmFiiE6k0knjcM+e0E3f1g9kFXgy/dUIOlty4SlS3hbv1UHS/BYXakH7d0lb4mrNxHIGNuIyFRmMpbZ4KyXDJo5nCQqvW0dZKAikpavf58/S8xbYyhJTImNJaUMZYQ5m8KD6H1ME48Hr3Q+Vgte9cXrTCreK1tVqCCy/ZaQGC7Z/qPOC+D849hi9g==',
    publicKeyUrl2: 'https://d2wbnl47m3ubk3.cloudfront.net/pub-key-2.pem',
    invalidSignature: 'hXC8F1eTt8Xmz7ec/9MkHqfzubDCSfGsgb8dWD0F+hQ='
  }
}

const testEvent = {
  event: '{"event_id":"eventId1","event":{"hello":"world"},"recipient_client_id":"client_id1"}'
}

const testEncodedPayload = {
  event: 'eyJldmVudF9pZCI6ImV2ZW50SWQxIiwiZXZlbnQiOnsiaGVsbG8iOiJ3b3JsZCJ9LCJyZWNpcGllbnRfY2xpZW50X2lkIjoiY2xpZW50X2lkMSJ9'
}

const testEncodedInvalidPayload = {
  event: 'eyJldmVudF9pZCI6ImV2ZW50SWQxIiwiZXZlbnQiOnsiaGVsbG8iOiJ3b3JsZCJ9LCJyZWNpcGllbnRfY2xpZW50X2lkIjoiY2xpZW50X2lkMSJ9123'
}

const testClientId = {
  recipientClientId: 'client_id1'
}

const testPubKeys = {
  validTestPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFyR3dVSUlkYUJTVXJacTRWMjRjTApSM0kxOWdlbDl1QkJtWEUzbHQ0b1ZIRjBsTXNIbkE3MmNKTmYvSVBGWURXRWxNL3RFNGJhdDhwNzhPMlpRcHVzCjZuemkvSVNmU1dwcldodlR1STVzS3g2Q1ZnYlJJelVNNlZUSWN2bzhvM1BLNDlIYmdhY1JpVUFCWjF1Tm83Q3oKUGZtdTV4QVkrbDJJZTFEdDh5cGVyb3RLQUtKbXVQWWVGV0tHZTl0emJQWWdGbHVDeThEalBwMmdHc21qc29yUgovQ1ZSSnE4ZldsNWFUTGhhK1pIU1R1eU5ZK1JRaEMvZlo3Q0hmODlFZFN2b255dTZXNy9TSm1TZjlER0dqbVgwCkhKTlJFcWRURTlRZGJTQk1mTm4vcGE5ZkNHd1IzeUVvQVpDa2ZWRzA2WHgwMnZPSTBRMVJBa2YydEdoTzRic1oKY3dJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t',
  invalidTestPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFyR3dVSUlkYUJTVXJacTRWMjRjTApSM0kxOWdlbDl1QkJtWEUzbHQ0b1ZIRjBsTXNIbkE3MmNKTmYvSVBGWURXRWxNL3RFNGJhdDhwNzhPMlpRcHVzCjZuemkvSVNmU1dwcldodlR1STVzS3g2Q1ZnYlJJelVNNlZUSWN2bzhvM1BLNDlIYmdhY1JpVUFCWjF1Tm83Q3oKUGZtdTV4QVkrbDJJZTFEdDh5cGVyb3RLQUtKbXVQWWVGV0tHZTl0emJQWWdGbHVDeThEalBwMmdHc21qc29yUgovQ1ZSSnE4ZldsNWFUTGhhK1pIU1R1eU5ZK1JRaEMvZlo3Q0hmODlFZFN2b255dTZXNy9TSm1TZjlER0dqbVgwCkhKTlJFcWRURTlRZGJTQk1mTm4vcGE5ZkNHd1IzeUVvQVpDa2ZWRzA2WHgwMnZPSTBRMVJBa2YydEdoTzRic1oKY3dJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t123'
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
  updateWebhookRegistrationResponse: updateWebhookRegistrationResponse,
  updateWebhookRegistration: updateWebhookRegistration,
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
  journalPollerNoContentMissingRetryAfter: journalPollerNoContentMissingRetryAfter,
  signatureOptions: signatureOptions,
  testEvent: testEvent,
  testEncodedPayload: testEncodedPayload,
  testEncodedInvalidPayload: testEncodedInvalidPayload,
  testClientId: testClientId,
  testPubKeys: testPubKeys
}

module.exports = {
  data: data
}
