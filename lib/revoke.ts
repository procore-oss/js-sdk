import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults } from './clientOptions'

export interface RevokeConfig {
  token: string;
  clientId: string;
  clientSecret: string;
}

async function revoke({ token, clientId, clientSecret }: RevokeConfig, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  const res = await fetch(`${_options.apiHostname}/oauth/revoke`,
    {
      method: 'POST',
      headers: {
        // TODO: IS THIS REQUIRED FOR REVOKE? 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'token': token,
        'client_id': clientId,
        'client_secret': clientSecret
      })
    }
  ); // TODO: What should we do in the error case.
  return res.json();
}

export default revoke
