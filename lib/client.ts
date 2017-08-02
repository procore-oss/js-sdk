import 'isomorphic-fetch'
import { stringify } from 'qs'
import * as S from 'string'
import * as when from 'ramda/src/when'
import * as not from 'ramda/src/not'
import * as isNil from 'ramda/src/isNil'
import * as compose from 'ramda/src/compose'
import * as ifElse from 'ramda/src/ifElse'
import * as concat from 'ramda/src/concat'
import * as is from 'ramda/src/is'
import * as identity from 'ramda/src/identity'
import { Authorizer } from './interfaces'
import hostname from './hostname'

export interface EndpointConfig {
  base: string;
  action?: string;
  params?: any;
  qs?: any;
}

type Endpoint = EndpointConfig | string

export interface ClientConfig {
  authorize(request: Function): Promise<any>
}

interface SDKResponse {
  body: any;
  response: any;
  request: any;
}

const notNil = compose(
  not,
  isNil
)

function authValid(response): any {
  if (response.status === 403 || response.status === 401 || !response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  } else {
   return response
  }
}

function mergeHeaders(headers: object | Headers): Headers {

}

const baseRequest = (defaults: RequestInit): Function => (url: string, config: RequestInit): Function => {
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  headers.append('Content-Type', 'application/json')

  let opts: RequestInit = { mode: 'cors', credentials: 'include', headers, ...defaults,  ...config }

  return function authorizedRequest([authKey, authValue]: Array<string>): Promise<SDKResponse> {
    opts.headers.set(authKey, authValue)

    const request = fetch(url, opts)

    return request
      .then(authValid)
      .then((response) => new Promise((res, rej) => {
        return response
          .json()
          .then((body) => {
            res({ body, request, response })
          })
          .catch(rej);
      }))
  }
}

export class Client {
  private readonly host: string;
  private authorize: any;
  private request: Function;

  constructor(authorizer: Authorizer, config: RequestInit = {}, host: string = hostname) {
    this.authorize = authorizer.authorize
    this.host = host
    this.request = baseRequest(config)
  }

  public get = (endpoint: Endpoint): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'GET' }))

  public post = (endpoint: Endpoint, payload: any): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'POST' , body: JSON.stringify(payload)}))

  public patch = (endpoint: Endpoint, payload: any): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'PATCH', body: JSON.stringify(payload)}))

  public destroy = (endpoint: Endpoint): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'DESTROY' }))

  private url = (endpoint: Endpoint): string => ifElse(
    is(String),
    concat(this.host),
    this.urlConfig
  )(endpoint)

  private urlConfig = ({ base, action, params = {}, qs }: EndpointConfig): string => compose(
    when(
      () => notNil(qs),
      finalUrl => `${finalUrl}?${stringify(qs)}`
    ),
    when(
      () => notNil(action),
      resourceUrl => `${resourceUrl}/${action}`
    ),
    when(
      () => notNil(params.id),
      collectionUrl => `${collectionUrl}/${params.id}`
    ),
    (hostname) => `${hostname}${S(base).template(params, '{', '}').s}`
  )(this.host)
}

function client(authorizer: Authorizer, defaults: RequestInit = {}, host: string = hostname): Client {
  return new Client(authorizer, defaults, host)
}

export default client
