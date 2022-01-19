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
 *
 * @param {string} organizationId The organization id from your integration
 * @param {string} apiKey The api key from your integration
 * @param {string} accessToken JWT Token for the integration with IO Management API scope
 * @param {EventsCoreAPIOptions} [httpOptions] Options to configure API calls
 * @returns {Promise<EventsCoreAPI>} returns object of the class EventsCoreAPI
 */
declare function init(organizationId: string, apiKey: string, accessToken: string, httpOptions?: EventsCoreAPIOptions): Promise<EventsCoreAPI>;

/**
 * This class provides methods to call your Adobe I/O Events APIs.
 * Before calling any method initialize the instance by calling the `init` method on it
 * with valid values for organizationId, apiKey and accessToken
 */
declare class EventsCoreAPI {
    /**
     * Initialize SDK.
     *
     * @param {string} organizationId The organization id from your integration
     * @param {string} apiKey The api key from your integration
     * @param {string} accessToken JWT Token for the integration with IO Management API scope
     * @param {EventsCoreAPIOptions} [httpOptions] Options to configure API calls
     * @returns {Promise<EventsCoreAPI>} returns object of the class EventsCoreAPI
     */
    init(organizationId: string, apiKey: string, accessToken: string, httpOptions?: EventsCoreAPIOptions): Promise<EventsCoreAPI>;
    /** Http options {retries, timeout}
     */
    httpOptions: EventsCoreAPIOptions;
    /** The organization id from your integration
     */
    organizationId: string;
    /** The api key from your integration
     */
    apiKey: string;
    /** The JWT Token for the integration with IO Management API scope
     */
    accessToken: string;
    /**
     * Fetch all the providers
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @returns {Promise<object>} Returns list of providers for the org
     */
    getAllProviders(consumerOrgId: string): Promise<object>;
    /**
     * Fetch a provider
     *
     * @param {string} providerId The id that uniquely identifies the provider to be fetched
     * @param {boolean} [fetchEventMetadata] Set this to true if you want to fetch the associated eventmetadata of the provider
     * @returns {Promise<object>} Returns the provider specified by the provider id
     */
    getProvider(providerId: string, fetchEventMetadata?: boolean): Promise<object>;
    /**
     * Create a new provider given the provider details
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {object} body Json data that describes the provider
     * @returns {Promise<object>} Returns the details of the provider created
     */
    createProvider(consumerOrgId: string, projectId: string, workspaceId: string, body: any): Promise<object>;
    /**
     * Update a provider given the id and provider details
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {string} providerId The id that uniquely identifies the provider to be updated
     * @param {object} body Json data that describes the provider
     * @returns {Promise<object>} Returns the details of the provider updated
     */
    updateProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, body: any): Promise<object>;
    /**
     * Delete a provider given the id
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {string} providerId The id that uniquely identifies the provider to be deleted
     * @returns {Promise<object>} Returns an empty object if the deletion was successful
     */
    deleteProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string): Promise<object>;
    /**
     * Get all event metadata for a provider
     *
     * @param {string} providerId The id that uniquely identifies the provider whose event metadata is to be fetched
     * @returns {Promise<object>} List of all event metadata of the provider
     */
    getAllEventMetadataForProvider(providerId: string): Promise<object>;
    /**
     * Get an event metadata for given provider and event code
     *
     * @param {string} providerId The id that uniquely identifies the provider whose event metadata is to be fetched
     * @param {string} eventCode The specific event code for which the details of the event metadata is to be fetched
     * @returns {Promise<object>} Event metadata that corresponds to the specified event code
     */
    getEventMetadataForProvider(providerId: string, eventCode: string): Promise<object>;
    /**
     * Create an event metadata for a provider
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {string} providerId provider for which the event metadata is to be added
     * @param {object} body Json data that describes the event metadata
     * @returns {Promise<object>} Details of the event metadata created
     */
    createEventMetadataForProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, body: any): Promise<object>;
    /**
     * Update the event metadata for a provider
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {string} providerId provider for which the event metadata is to be updated
     * @param {string} eventCode eventCode of the event metadata to be updated
     * @param {object} body Json data that describes the event metadata
     * @returns {Promise<object>} Details of the event metadata updated
     */
    updateEventMetadataForProvider(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, eventCode: string, body: any): Promise<object>;
    /**
     * Delete an event metadata of a provider
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {string} providerId provider for which the event metadata is to be updated
     * @param {string} eventCode eventCode of the event metadata to be updated
     * @returns {Promise<object>} Empty object if deletion was successful
     */
    deleteEventMetadata(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string, eventCode: string): Promise<object>;
    /**
     * Delete all event metadata of a provider
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} projectId Project Id from the console
     * @param {string} workspaceId Workspace Id from the console
     * @param {string} providerId provider for which the event metadata is to be updated
     * @returns {Promise<object>} Empty object if deletion was successful
     */
    deleteAllEventMetadata(consumerOrgId: string, projectId: string, workspaceId: string, providerId: string): Promise<object>;
    /**
     * Create a webhook or journal registration
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} integrationId integration Id from the console
     * @param {object} body Json data contains details of the registration
     * @returns {Promise<object>} Details of the webhook/journal registration created
     */
    createWebhookRegistration(consumerOrgId: string, integrationId: string, body: any): Promise<object>;
    /**
     * Get registration details for a given registration
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} integrationId Integration Id from the console
     * @param {string} registrationId Registration id whose details are to be fetched
     * @returns {Promise<object>} Details of the webhook/journal registration
     */
    getWebhookRegistration(consumerOrgId: string, integrationId: string, registrationId: string): Promise<object>;
    /**
     * Get all registration details for a given integration
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} integrationId Integration Id from the console
     * @returns {Promise<object>} List of all webhook/journal registrations
     */
    getAllWebhookRegistrations(consumerOrgId: string, integrationId: string): Promise<object>;
    /**
     * Delete webhook registration
     *
     * @param {string} consumerOrgId Consumer Org Id from the console
     * @param {string} integrationId Integration Id from the console
     * @param {string} registrationId Id of the registration to be deleted
     * @returns {Promise<object>} Empty object if deletion was successful
     */
    deleteWebhookRegistration(consumerOrgId: string, integrationId: string, registrationId: string): Promise<object>;
    /**
     * Publish cloud events to Adobe I/O Events
     *
     * @param {object} cloudEvent Object to be published to event receiver in cloud event format
     * @returns {Promise<string>} Returns OK/ undefined in case of success and error in case of failure
     */
    publishEvent(cloudEvent: any): Promise<string>;
    /**
     * Get events from a journal.
     *
     * @param {string} journalUrl URL of the journal or 'next' link to read from (required)
     * @param {EventsJournalOptions} [eventsJournalOptions] Query options to send with the URL
     * @returns {Promise<object>} with the response json includes events and links (if available)
     */
    getEventsFromJournal(journalUrl: string, eventsJournalOptions?: EventsJournalOptions): Promise<object>;

    /**
     * Get observable to start listening to journal events.
     *
     * @param {string} journalUrl URL of the journal or 'next' link to read from (required)
     * @param {EventsJournalOptions} [eventsJournalOptions] Query options to send with the Journal URL
     * @param {EventsJournalPollingOptions} [eventsJournalPollingOptions] Journal polling options
     * @returns {Observable<object>} observable to which the user can subscribe to in order to listen to events
     */
    getEventsObservableFromJournal(journalUrl: string, eventsJournalOptions?: EventsJournalOptions, eventsJournalPollingOptions?: EventsJournalPollingOptions): Observable<object>;
    /**
     * Authenticating events by verifying signature
     *
     * @param {object} event JSON payload delivered to the registered webhook URL
     * @param {string} clientSecret Client secret can be retrieved from the Adobe I/O Console integration
     * @param {string} signatureHeaderValue Value of x-adobe-signature header in each POST request to the registered webhook URL
     * @returns {boolean} If signature matches return true else return false
     */
    verifySignatureForEvent(event: any, clientSecret: string, signatureHeaderValue: string): boolean;

    /**
     * Authenticating events by verifying digital signature
     * @param {object} event JSON payload delivered to the registered webhook URL
     * @param {string} recipientClientId Target recipient client id retrieved from the Adobe I/O Console integration
     * @param {SignatureOptions} signatureOptions Map of all digital signature header values consisting fields defined in SignatureOptions
     * @returns {boolean} If signature matches return true else return false
     */
    verifyDigitalSignatureForEvent(event: any, recipientClientId: string, signatureOptions?: SignatureOptions): boolean;
}

/**
 * @typedef {object} EventsJournalOptions
 * @property {boolean} [latest] Retrieve latest events (optional)
 * @property {string} [since] Position at which to start fetching the events from (optional)
 * @property {number} [limit] Maximum number of events to retrieve (optional)
 */
declare type EventsJournalOptions = {
    latest?: boolean;
    since?: string;
    limit?: number;
};

/**
 * @typedef {object} EventsJournalPollingOptions
 * @property {number} [interval] Interval at which to poll the journal; If not provided, a default value will be used (optional)
 */
declare type EventsJournalPollingOptions = {
    interval?: number;
};

/**
 * @typedef {object} SignatureOptions
 * @property {string} [digiSignature1] Value of digital signature retrieved from the x-adobe-digital-signature1 header in each POST request to webhook
 * @property {string} [digiSignature2] Value of digital signature retrieved from the x-adobe-digital-signature2 header in each POST request to webhook
 * @property {string} [publicKeyUrl1] Value of public key url retrieved from the x-adobe-public-key1-url header in each POST request to webhook
 * @property {string} [publicKeyUrl2] Value of public key url retrieved from the x-adobe-public-key2-url header in each POST request to webhook
 */
declare type SignatureOptions = {
    digiSignature1?: string;
    digiSignature2?: string;
    publicKeyUrl1?: string;
    publicKeyUrl2?: string;
};

