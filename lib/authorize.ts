import hostname from './hostname'

export interface AuthorizeConfig {
  clientId: string;
  uri: string;
}

function authorize({ clientId, uri }: AuthorizeConfig): string {
  return `${hostname}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${uri}`
}


export default authorize
