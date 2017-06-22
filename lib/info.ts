import 'isomorphic-fetch'
import _hostname from './hostname'

function info(token: string, hostname?: string = _hostname): Promise<any> {
  return fetch(`${hostname}/oauth/token/info`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
    .then((res) => res.json())
}

export default info
