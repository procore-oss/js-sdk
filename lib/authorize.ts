import { ClientOptions, convert } from './clientOptions'

export interface AuthorizeConfig {
  clientId: string;
  uri: string;
}

function authorize({ clientId, uri }: AuthorizeConfig, options: ClientOptions | string): string {
  return `${convert(options).apiHostname}/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(uri)}`
}

export default authorize
