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
import { Authorizer } from './interfaces'
import hostname from './hostname'

export interface EndpointConfig {
  base: string;
  api_version?: string;
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

function defaultFormatter(response: Response) {
  return response.json();
}

const baseRequest = (defaults: RequestInit): Function => (url: string, config: RequestInit, reqConfig?: RequestConfig): Function => {
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  headers.append('Content-Type', 'application/json')

  let opts: RequestInit = { mode: 'cors', credentials: 'include', headers, ...defaults,  ...config }

  return function authorizedRequest([authKey, authValue]: Array<string>): Promise<SDKResponse> {
    if (opts.headers instanceof Headers) {
      opts.headers.set(authKey, authValue)
    } else {
      opts.headers[authKey] = authValue
    }

    const request = fetch(url, opts)
    const formatter = reqConfig && reqConfig.formatter ? reqConfig.formatter : defaultFormatter;

    return request
      .then((response) => {
        return formatter(response)
          .then((body) => new Promise((res, rej) => {
            const sdkResp = {body, request, response}

            response.ok ? res(sdkResp) : rej(sdkResp)
          }))
      })
  }
}

interface RequestConfig {
  formatter?(response: Response): Promise<any>;
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

  public get = (endpoint: Endpoint, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'GET' }, reqConfig))

  public post = (endpoint: Endpoint, payload: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'POST' , body: JSON.stringify(payload)}, reqConfig))

  public patch = (endpoint: Endpoint, payload: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'PATCH', body: JSON.stringify(payload)}, reqConfig))

  public destroy = (endpoint: Endpoint, payload?: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'DELETE', body: JSON.stringify(payload)}, reqConfig))

  private url = (endpoint: Endpoint): string => ifElse(
    is(String),
    concat(this.host),
    this.urlConfig
  )(endpoint)

  private urlConfig = ({ base, action, params = {}, qs, api_version }: EndpointConfig): string => compose(
    when(
      () => notNil(qs),
      finalUrl => `${finalUrl}?${stringify(qs, { arrayFormat: 'brackets' })}`
    ),
    when(
      () => notNil(action),
      resourceUrl => `${resourceUrl}/${action}`
    ),
    when(
      () => notNil(params.id),
      collectionUrl => `${collectionUrl}/${params.id}`
    ),
    (hostname) => `${hostname}/${this.version(api_version)}${S(base).template(params, '{', '}').s}`
  )(this.host)

  private version = (api_version: string): string => {
    api_version = (api_version === undefined || api_version === '') ? 'v1.0' : api_version;
    if (api_version === 'vapid' || api_version === 'vapid/') {
      return api_version
    } else if(api_version.match(/v\d+\.\d+/)) {
      return `rest/${api_version}`
    } else {
      throw new Error(`'${api_version}' is an invalid Procore API version`)
    }
  }
}

function client(authorizer: Authorizer, defaults: RequestInit = {}, host: string = hostname): Client {
  return new Client(authorizer, defaults, host)
}

export default client
