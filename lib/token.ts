import 'isomorphic-fetch'
import { ClientOptions, convert } from './clientOptions'

export interface TokenConfig {
  id: string;
  secret: string;
  code: string;
  uri: string;
}

async function token({ id, secret, code, uri }: TokenConfig, options: ClientOptions | string): Promise<any> {
  const res = await fetch(
    `${convert(options).apiHostname}/oauth/token`,
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
