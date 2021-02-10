import _hostname from './hostname'

export interface ImplicitConfig {
  id: string;
  uri: string;
}

function implicit({ id, uri }: ImplicitConfig, hostname: string = _hostname): string {
  return `${hostname}/oauth/authorize?response_type=token&client_id=${id}&redirect_uri=${uri}`;
}

export default implicit
