import {Observable} from "rxjs";

/**
 * @typedef {object} EventsCoreAPIOptions
 * @property {number} [timeout] Http request timeout in ms (optional)
 * @property {number} [retries] Number of retries in case of 5xx errors. Default 0 (optional)
 */
declare type EventsCoreAPIOptions = {
    timeout?: number;
    retries?: number;
};

/**
 * Returns a Promise that resolves with a new EventsCoreAPI object.
 * @param organizationId - The organization id from your integration
 * @param apiKey - The api key from your integration
 * @param accessToken - JWT Token for the integration with IO Management API scope
 * @param [httpOptions] - Options to configure API calls
 * @returns returns object of the class EventsCoreAPI
 */
declare function init(organizationId: string, apiKey: string, accessToken: string, httpOptions?: EventsCoreAPIOptions): Promise<EventsCoreAPI>;

/**
 * This class provides methods to call your Adobe I/O Events APIs.
 * Before calling any method initialize the instance by calling the `init` method on it
 * with valid values for organizationId, apiKey, accessToken and optional http options such as timeout
 * and max number of retries
 */
declare class EventsCoreAPI {
    /**
     * Initialize SDK.
     * @param organizationId - The organization id from your integration
     * @param apiKey - The api key from your integration
     * @param accessToken - JWT Token for the integration with IO Management API scope
     * @param [httpOptions] - Options to configure API calls
     * @returns returns object of the class EventsCoreAPI
     */
    init(organizationId: string, apiKey: string, accessToken: string, httpOptions?: EventsCoreAPIOptions): Promise<EventsCoreAPI>;
    /**
     * Http options {retries, timeout}
     */
    httpOptions: EventsCoreAPIOptions;
    /**
     * The organization id from your integration
     */
    organizationId: string;
    /**
     * The api key from your integration
     */
    apiKey: string;
    /**
     * The JWT Token for the integration with IO Management API scope
     */
    accessToken: string;
    /**
     * Fetch all the providers
     * @param consumerOrgId - Consumer Org Id from the console
     * @returns Returns list of providers for the org
     */
    getAllProviders(consumerOrgId: string): Promise<object>;
    /**
     * Fetch a provider
     * @param providerId - The id that uniquely identifies the provider to be fetched
     * @param [fetchEventMetadata = false] - Set this to true if you want to fetch the associated eventmetadata of the provider
     * @returns Returns the provider specified by the provider id
     */
    getProvider(providerId: string, fetchEventMetadata?: boolean): Promise<object>;
    /**
     * Create a new provider given the provider details
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param body - Json data that describes the provider
     * @returns Returns the details of the provider created
     */
    createProvider(consumerOrgId: string, projectId: string, workspaceId: string, body: ProviderInputModel): Promise<object>;
    /**
     * Update a provider given the id and provider details
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param providerId - The id that uniquely identifies the provider to be updated
     * @param body - Json data that describes the provider
     * @returns Returns the details of the provider updated
     */
    updateProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, body: ProviderInputModel): Promise<object>;
    /**
     * Delete a provider given the id
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param providerId - The id that uniquely identifies the provider to be deleted
     * @returns Returns an empty object if the deletion was successful
     */
    deleteProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string): Promise<object>;
    /**
     * Get all event metadata for a provider
     * @param providerId - The id that uniquely identifies the provider whose event metadata is to be fetched
     * @returns List of all event metadata of the provider
     */
    getAllEventMetadataForProvider(providerId: string): Promise<object>;
    /**
     * Get an event metadata for given provider and event code
     * @param providerId - The id that uniquely identifies the provider whose event metadata is to be fetched
     * @param eventCode - The specific event code for which the details of the event metadata is to be fetched
     * @returns Event metadata that corresponds to the specified event code
     */
    getEventMetadataForProvider(providerId: string, eventCode: string): Promise<object>;
    /**
     * Create an event metadata for a provider
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param providerId - provider for which the event metadata is to be added
     * @param body - Json data that describes the event metadata
     * @returns Details of the event metadata created
     */
    createEventMetadataForProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, body: EventMetadataInputModel): Promise<object>;
    /**
     * Update the event metadata for a provider
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param providerId - provider for which the event metadata is to be updated
     * @param eventCode - eventCode of the event metadata to be updated
     * @param body - Json data that describes the event metadata
     * @returns Details of the event metadata updated
     */
    updateEventMetadataForProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, eventCode: string, body: EventMetadataInputModel): Promise<object>;
    /**
     * Delete an event metadata of a provider
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param providerId - provider for which the event metadata is to be updated
     * @param eventCode - eventCode of the event metadata to be updated
     * @returns Empty object if deletion was successful
     */
    deleteEventMetadata(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, eventCode: string): Promise<object>;
    /**
     * Delete all event metadata of a provider
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param providerId - provider for which the event metadata is to be updated
     * @returns Empty object if deletion was successful
     */
    deleteAllEventMetadata(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string): Promise<object>;
    /**
     * Create a webhook or journal registration
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param body - Json data contains details of the registration
     * @returns Details of the webhook/journal registration created
     */
    createRegistration(consumerOrgId: string, projectId: string, workspaceId: string, body: RegistrationCreateModel): Promise<object>;
    /**
     * Update a webhook or journal registration
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param registrationId - Registration id whose details are to be fetched
     * @param body - Json data contains details of the registration
     * @returns Details of the webhook/journal registration to be updated
     */
    updateRegistration(consumerOrgId: string, projectId: string, workspaceId: string, registrationId: string, body: RegistrationUpdateModel): Promise<object>;
    /**
     * Get registration details for a given registration
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param registrationId - Registration id whose details are to be fetched
     * @returns Details of the webhook/journal registration
     */
    getRegistration(consumerOrgId: string, projectId: string, workspaceId: string, registrationId: string): Promise<object>;
    /**
     * Get all registration details for a workspace
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @returns List of all webhook/journal registrations
     */
    getAllRegistrationsForWorkspace(consumerOrgId: string, projectId: string, workspaceId: string): Promise<object>;
    /**
     * Get all registration details for an org
     * @param consumerOrgId - Consumer Org Id from the console
     * @param [page] - page size and page number
     * @returns Paginated response of all webhook/journal registrations for an org
     */
    getAllRegistrationsForOrg(consumerOrgId: string, page?: Page): Promise<object>;
    /**
     * Delete webhook registration
     * @param consumerOrgId - Consumer Org Id from the console
     * @param projectId - Project Id from the console
     * @param workspaceId - Workspace Id from the console
     * @param registrationId - Id of the registration to be deleted
     * @returns Empty object if deletion was successful
     */
    deleteRegistration(consumerOrgId: string, projectId: string, workspaceId: string, registrationId: string): Promise<object>;
    /**
     * Publish Cloud Events
     *
     * Event publishers can publish events to the Adobe I/O Events using this SDK. The events should follow Cloud Events 1.0 specification: https://github.com/cloudevents/spec/blob/v1.0/spec.md.
     * As of now, only application/json is accepted as the content-type for the "data" field of the cloud event.
     * If retries are set, publish events are retried on network issues, 5xx and 429 error response codes.
     * @param cloudEvent - Object to be published to event receiver in cloud event format
     * @returns Returns OK/ undefined in case of success and error in case of failure
     */
    publishEvent(cloudEvent: any): Promise<string>;
    /**
     * Get events from a journal.
     * @param journalUrl - URL of the journal or 'next' link to read from (required)
     * @param [eventsJournalOptions] - Query options to send with the URL
     * @param [fetchResponseHeaders] - Set this to true if you want to fetch the complete response headers
     * @returns with the response json includes events and links (if available)
     */
    getEventsFromJournal(journalUrl: string, eventsJournalOptions?: EventsJournalOptions, fetchResponseHeaders?: boolean): Promise<object>;
    /**
     * getEventsObservableFromJournal returns an RxJS <a href="https://rxjs-dev.firebaseapp.com/guide/observable">Observable</a>
     *
     * One can go through the extensive documentation on <a href="https://rxjs-dev.firebaseapp.com/guide/overview">RxJS</a> in order to learn more
     * and leverage the various <a href="https://rxjs-dev.firebaseapp.com/guide/operators">RxJS Operators</a> to act on emitted events.
     * @param journalUrl - URL of the journal or 'next' link to read from (required)
     * @param [eventsJournalOptions] - Query options to send with the Journal URL
     * @param [eventsJournalPollingOptions] - Journal polling options
     * @returns observable to which the user can subscribe to in order to listen to events
     */
    getEventsObservableFromJournal(journalUrl: string, eventsJournalOptions?: EventsJournalOptions, eventsJournalPollingOptions?: EventsJournalPollingOptions): Observable<object>;
    /**
     * Authenticating events by verifying digital signature
     * @param event - JSON payload delivered to the registered webhook URL
     * @param recipientClientId - Target recipient client id retrieved from the Adobe I/O Console integration
     * @param signatureOptions - map of all digital signature header values consisting fields as below
     * digiSignature1 : Value of digital signature retrieved from the x-adobe-digital-signature1 header in each POST request to webhook
     * digiSignature2 : Value of digital signature retrieved from the x-adobe-digital-signature2 header in each POST request to webhook
     * publicKeyPath1 : Relative path of ioevents public key retrieved from the x-adobe-public-key1-path header in each POST request to webhook
     * publicKeyPath2 : Relative path of ioevents public key retrieved from the x-adobe-public-key2-path header in each POST request to webhook
     * @returns If signature matches return true else return false
     */
    verifyDigitalSignatureForEvent(event: any, recipientClientId: string, signatureOptions?: SignatureOptions): boolean;
}

/**
 * @property label - The label of this Events Provider
 * @property [description] - The description of this Events Provider
 * @property [docs_url] - The documentation url of this Events Provider
 */
declare type ProviderInputModel = {
    label: string;
    description?: string;
    docs_url?: string;
};

/**
 * @property label - The description of this Event Metadata
 * @property description - The label of this Event Metadata
 * @property event_code - The event_code of this Event Metadata. This event_code describes the type of event. Ideally it should be prefixed with a reverse-DNS name (dictating the organization which defines the semantics of this event type) It is equivalent to the CloudEvents' type. See https://github.com/cloudevents/spec/blob/master/spec.md#type
 * @property [sample_event_template] - An optional base64 encoded sample event template
 */
declare type EventMetadataInputModel = {
    label: string;
    description: string;
    event_code: string;
    sample_event_template?: string;
};

/**
 * @property provider_id - The id of the provider of the events to be subscribed
 * @property event_code - The requested valid event code belonging to the provider
 */
declare type EventsOfInterest = {
    provider_id: string;
    event_code: string;
};

/**
 * @property client_id - Client id for which the registration is created
 * @property name - The name of the registration
 * @property description - The description of the registration
 * @property [webhook_url] - A valid webhook url where the events would be delivered for webhook or webhook_batch delivery_type
 * @property events_of_interest - The events for which the registration is to be subscribed to
 * @property delivery_type - Delivery type can either be webhook|webhook_batch|journal.
 * @property [enabled] - Enable or disable the registration. Default true.
 */
declare type RegistrationCreateModel = {
    client_id: string;
    name: string;
    description: string;
    webhook_url?: string;
    events_of_interest: EventsOfInterest[];
    delivery_type: string;
    enabled?: string;
};

/**
 * @property name - The name of the registration
 * @property description - The description of the registration
 * @property [webhook_url] - A valid webhook url where the events would be delivered for webhook or webhook_batch delivery_type
 * @property events_of_interest - The events for which the registration is to be subscribed to
 * @property delivery_type - Delivery type can either be webhook|webhook_batch|journal.
 * @property [enabled] - Enable or disable the registration. Default true.
 */
declare type RegistrationUpdateModel = {
    name: string;
    description: string;
    webhook_url?: string;
    events_of_interest: EventsOfInterest[];
    delivery_type: string;
    enabled?: string;
};

/**
 * @property [page] - page number to be fetched. Default 0 (optional)
 * @property [size] - size of each page. Default 10 (optional)
 */
declare type Page = {
    page?: number;
    size?: number;
};

/**
 * @property [latest] - Retrieve latest events (optional)
 * @property [since] - Position at which to start fetching the events from (optional)
 * @property [limit] - Maximum number of events to retrieve (optional)
 */
declare type EventsJournalOptions = {
    latest?: boolean;
    since?: string;
    limit?: number;
};

/**
 * @property [interval] - Interval at which to poll the journal; If not provided, a default value will be used (optional)
 */
declare type EventsJournalPollingOptions = {
    interval?: number;
};

/**
 * @typedef {object} SignatureOptions
 * @property [digiSignature1] - Value of digital signature retrieved from the x-adobe-digital-signature1 header in each POST request to webhook
 * @property [digiSignature2] - Value of digital signature retrieved from the x-adobe-digital-signature2 header in each POST request to webhook
 * @property [publicKeyUrl1] - Value of public key url retrieved from the x-adobe-public-key1-url header in each POST request to webhook
 * @property [publicKeyUrl2] - Value of public key url retrieved from the x-adobe-public-key2-url header in each POST request to webhook
 */
declare type SignatureOptions = {
    digiSignature1: string;
    digiSignature2: string;
    publicKeyUrl1: string;
    publicKeyUrl2: string;
};
