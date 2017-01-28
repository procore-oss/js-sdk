import 'isomorphic-fetch'
import hostname from './hostname'

function refresh({ id, secret, uri, token, refresh }) {
  return fetch(
      `${hostname}/oauth/token?grant_type=refresh_token&$client_id=${id}&client_secret=${secret}&redirect_uri=${uri}&refresh_token=${refresh}`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
    )
    .then(res => res.json())
}

export default refresh
