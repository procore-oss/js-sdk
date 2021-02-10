import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults} from './clientOptions'

function info(token: string, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  return fetch(`${_options.apiHostname}/oauth/token/info`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
}

export default info
