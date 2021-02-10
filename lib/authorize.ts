import { ClientOptions, ClientOptionsDefaults} from './clientOptions'

export interface AuthorizeConfig {
  clientId: string;
  uri: string;
}

function authorize({ clientId, uri }: AuthorizeConfig, options: ClientOptions = ClientOptionsDefaults): string {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  return `${_options.apiHostname}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${uri}`
}

export default authorize
