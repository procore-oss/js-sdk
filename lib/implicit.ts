import { ClientOptions, convert } from './clientOptions'

export interface ImplicitConfig {
  id: string;
  uri: string;
}

function implicit({ id, uri }: ImplicitConfig, options: ClientOptions | string): string {
  return `${convert(options).apiHostname}/oauth/authorize?response_type=token&client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(uri)}`;
}

export default implicit
