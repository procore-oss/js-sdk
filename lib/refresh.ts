import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults } from './clientOptions'

export interface RefreshConfig {
  id: string;
  secret: string;
  uri: string;
  token: string;
  refresh: string;
}

async function refresh({ id, secret, uri, token, refresh }: RefreshConfig, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  const res = await fetch(
    `${_options.apiHostname}/oauth/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'grant_type': 'refresh_token',
        'client_id': id,
        'client_secret': secret,
        'redirect_uri': uri,
        'refresh_token': refresh
      })
    }
  );
  return res.json();
}

export default refresh
