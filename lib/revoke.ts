import 'isomorphic-fetch'
import { ClientOptions, convert } from './clientOptions'

export interface RevokeConfig {
  token: string;
  clientId: string;
  clientSecret: string;
}

async function revoke({ token, clientId, clientSecret }: RevokeConfig, options: ClientOptions | string): Promise<any> {
  const res = await fetch(`${convert(options).apiHostname}/oauth/revoke`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'token': token,
        'client_id': clientId,
        'client_secret': clientSecret
      })
    }
  );
  return res.json();
}

export default revoke
