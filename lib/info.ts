import 'isomorphic-fetch'
import hostname from './hostname'

function info(token: string): Promise<any> {
  return fetch(`${hostname}/oauth/token/info`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
    .then((res) => res.json())
}

export default info
