import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults} from './clientOptions'

export interface RefreshConfig {
  id: string;
  secret: string;
  uri: string;
  token: string;
  refresh: string;
}

function refresh({ id, secret, uri, token, refresh }: RefreshConfig, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  return fetch(
      `${_options.apiHostname}/oauth/token?grant_type=refresh_token&$client_id=${id}&client_secret=${secret}&redirect_uri=${uri}&refresh_token=${refresh}`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(res => res.json())
}

export default refresh
