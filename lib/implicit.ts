import 'isomorphic-fetch'
import hostname from './hostname'

export interface ImplicitConfig {
  id: string;
  uri: string;
}

function implicit({ id, uri }: ImplicitConfig): string {
  return `${hostname}/oauth/authorize?response_type=token&client_id=${id}&redirect_uri=${uri}`;
}

export default implicit
