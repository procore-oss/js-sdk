import { ClientOptions, ClientOptionsDefaults } from './clientOptions'

export interface AuthorizeConfig {
  clientId: string;
  uri: string;
}

function authorize({ clientId, uri }: AuthorizeConfig, options: ClientOptions = ClientOptionsDefaults): string {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  return `${_options.apiHostname}/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(uri)}`
}

export default authorize
