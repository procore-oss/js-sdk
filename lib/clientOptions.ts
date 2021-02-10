export interface ClientOptions {
  apiHostname?: string;
  defaultVersion?: string;
}

export const ClientOptionsDefaults: ClientOptions = {
  apiHostname: "https://app.procore.com",
  defaultVersion: "v1.0"
};
