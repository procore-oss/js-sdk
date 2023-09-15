const ClientOptionsDefaults: ClientOptions = {
  apiHostname: "https://api.procore.com",
  defaultVersion: "v1.0"
};

export interface ClientOptions {
  apiHostname?: string;
  defaultVersion?: string;
  defaultCompanyId?: number | string;
}

export function convert(options: ClientOptions | string): ClientOptions {
  return Object.assign({}, ClientOptionsDefaults, ((typeof options === 'string') ? { apiHostname: options } : options));
}
