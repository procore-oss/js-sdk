import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults } from './clientOptions'

export interface TokenConfig {
  id: string;
  secret: string;
  code: string;
  uri: string;
}

async function token({ id, secret, code, uri }: TokenConfig, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  const res = await fetch(
    `${_options.apiHostname}/oauth/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': id,
        'client_secret': secret,
        'redirect_uri': uri,
      })
    }
  );
  return res.json();
}

export default token
