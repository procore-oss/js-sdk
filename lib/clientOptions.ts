const ClientOptionsDefaults: ClientOptions = {
  apiHostname: "https://app.procore.com",
  defaultVersion: "v1.0"
};

export interface ClientOptions {
  apiHostname?: string;
  defaultVersion?: string;
  company_id?: number;
}

export function convert(options: ClientOptions | string): ClientOptions {
  return Object.assign({}, ClientOptionsDefaults, ((typeof options === 'string') ? { apiHostname: options } : options));
}
