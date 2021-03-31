import 'isomorphic-fetch'
import { ClientOptions, convert } from './clientOptions'

async function info(token: string, options: ClientOptions | string): Promise<any> {
  const res = await fetch(
    `${convert(options).apiHostname}/oauth/token/info`,
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
