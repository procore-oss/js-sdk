import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults } from './clientOptions'

async function info(token: string, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  const res = await fetch(
    `${_options.apiHostname}/oauth/token/info`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  return res.json();
}

export default info
