import 'isomorphic-fetch'
import { ClientOptions, ClientOptionsDefaults} from './clientOptions'

export interface TokenConfig {
  id: string;
  secret: string;
  code: string;
  uri: string;
}

function token({ id, secret, code, uri }: TokenConfig, options: ClientOptions = ClientOptionsDefaults): Promise<any> {
  const _options = Object.assign({}, ClientOptionsDefaults, options);
  return fetch(
    `${_options.apiHostname}/oauth/token?grant_type=authorization_code&code=${code}&client_id=${id}&client_secret=${secret}&redirect_uri=${uri}`,
    { method: 'POST' })
    .then(res => res.json());
}

export default token
