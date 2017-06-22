import _hostname from './hostname'

export interface AuthorizeConfig {
  clientId: string;
  uri: string;
  hostname?: string;
}

function authorize({ clientId, uri, hostname = _hostname }: AuthorizeConfig): string {
  return `${hostname}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${uri}`
}


export default authorize
