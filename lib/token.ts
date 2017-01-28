import 'isomorphic-fetch'
import hostname from './hostname'

export interface TokenConfig {
  id: string;
  secret: string;
  code: string;
  uri: string;
}

function token({ id, secret, code, uri }: any): Promise<any> {
  return fetch(`${hostname}/oauth/token?grant_type=authorization_code&code=${code}&client_id=${id}&client_secret=${secret}&redirect_uri=${uri}`, { method: 'POST' })
    .then(res => res.json())
}

export default token
