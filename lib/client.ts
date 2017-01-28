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
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  return function authorizedRequest([authKey, authValue]: Array<string>): Promise<any> {
    headers.append(authKey, authValue)

    return fetch(url, { mode: 'cors', method, headers })
      .then(authValid)
      .then(res => res.json())
  }
}

export class Client {
  private readonly hostname: string = hostname;
  private authorize: any;

  constructor(authorizer: Authorizer) {
    this.authorize = authorizer.authorize
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
  )(this.hostname)

}

function client(authorizer: Authorizer) {
  return new Client(authorizer)
}

export default client
