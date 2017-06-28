import 'isomorphic-fetch'
import { stringify } from 'qs'
import * as S from 'string'
import { when, not, isNil, compose, ifElse, identity } from 'ramda'
import { Authorizer } from './interfaces'
import hostname from './hostname'

export interface Endpoint {
  base: string;
  action?: string;
  params?: any;
  qs?: any;
}

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
  if (response.status === 403) {
    throw new Error(`${response.status} ${response.statusText}`)
  } else {
   return response
  }
}

function request(url: string, payload: any, method: string): Function {
  const mode: RequestMode = 'cors';
  const credentials: RequestCredentials = 'include';
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  return function authorizedRequest([authKey, authValue]: Array<string>): Promise<SDKResponse> {
    headers.append(authKey, authValue)

    const defaultOpts = { mode, credentials, method, headers };
    const opts = payload ? Object.assign(defaultOpts, { body: JSON.stringify(payload) }) : defaultOpts;
    const request = fetch(url, opts);

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

  constructor(authorizer: Authorizer, host: string = hostname) {
    this.authorize = authorizer.authorize
    this.host = host
  }

  public get = (endpoint: Endpoint): Promise<any> =>
    this.authorize(request(this.url(endpoint), null, 'GET'))

  public post = (endpoint: Endpoint, payload: any): Promise<any> =>
    this.authorize(request(this.url(endpoint), payload, 'POST'))

  public patch = (endpoint: Endpoint, payload: any): Promise<any> =>
    this.authorize(request(this.url(endpoint), payload, 'PATCH'))

  public destroy = (endpoint: Endpoint): Promise<any> =>
    this.authorize(request(this.url(endpoint), null, 'DESTROY'))

  private url = ({ base, action, params, qs }: Endpoint): string => compose(
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
    hostname => `${hostname}${S(base).template(params, '{', '}').s}`
  )(this.host)

}

function client(authorizer: Authorizer, host: string = hostname) {
  return new Client(authorizer, host)
}

export default client
