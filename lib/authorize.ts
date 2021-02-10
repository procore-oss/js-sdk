import _hostname from './hostname'

export interface AuthorizeConfig {
  clientId: string;
  uri: string;
}

function authorize({ clientId, uri }: AuthorizeConfig, hostname: string = _hostname): string {
  return `${hostname}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${uri}`
}

export default authorize
