import 'isomorphic-fetch'
import { stringify } from 'qs'
import { Authorizer } from './interfaces'
import hostname from './hostname'

export interface EndpointConfig {
  base: string;
  apiVersion?: string;
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

const notNil = (v: any) => !(typeof v === 'undefined' || v === null || ((v.constructor === String || v instanceof String) && v.trim() === ''));
const TOKENS_REG_EX = new RegExp(/\/{(.*?)}/g);
const replaceParams = (str: string, params: any) => str.replace(TOKENS_REG_EX, (_, p) => params[p] ? `/${params[p]}` : '/');

function defaultFormatter(response: Response) {
  return response.json();
}

const baseRequest = (defaults: RequestInit): Function => (url: string, config: RequestInit, reqConfig?: RequestConfig): Function => {
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  headers.append('Content-Type', 'application/json')

  let opts: RequestInit = { mode: 'cors', credentials: 'include', headers, ...defaults, ...config }

  return async function authorizedRequest([authKey, authValue]: Array<string>): Promise<SDKResponse> {
    if (opts.headers instanceof Headers) {
      opts.headers.set(authKey, authValue);
    } else {
      opts.headers[authKey] = authValue;
    }

    const formatter = reqConfig && reqConfig.formatter ? reqConfig.formatter : defaultFormatter;
    const request = fetch(url, opts);
    const response = await request;
    const body = await formatter(response);

    return new Promise<SDKResponse>((resolve, reject) => {
      const sdkResp = { body, request, response };
      response.ok ? resolve(sdkResp) : reject(sdkResp);
    });
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
    this.authorize(this.request(this.url(endpoint), { method: 'POST', body: JSON.stringify(payload) }, reqConfig))

  public patch = (endpoint: Endpoint, payload: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'PATCH', body: JSON.stringify(payload) }, reqConfig))

  public destroy = (endpoint: Endpoint, payload?: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'DELETE', body: JSON.stringify(payload) }, reqConfig))

  private url = (endpoint: Endpoint): string =>
    notNil(endpoint) && (endpoint.constructor === String || endpoint instanceof String) ?
      `${this.host}${endpoint}` : // TODO: Do we want to allow this. Version will not be handled for this
      this.urlConfig(endpoint as EndpointConfig);

  private urlConfig = ({ base, action, params = {}, qs, apiVersion }: EndpointConfig): string => {
    let url = `${this.host}/${this.version(apiVersion)}${replaceParams(base, params)}`;

    if (notNil(params.id)) {
      url = `${url}/${params.id}`;
    }

    if (notNil(action)) {
      url = `${url}/${action}`;
    }

    if (notNil(qs)) {
      url = `${url}?${stringify(qs, { arrayFormat: 'brackets' })}`;
    }

    return url;
  };

  private version = (apiVersion: string = 'v1.0'): string => {
    const [, restVersion = undefined] = apiVersion.match(/(^v[1-9]\d*\.\d+$)/) || [];
    const [, vapidVersion = undefined] = apiVersion.match(/(^vapid)\/?$/) || [];

    if (restVersion) {
      return `rest/${restVersion}`;
    } else if (vapidVersion) {
      return vapidVersion;
    } else {
      throw new Error(`'${apiVersion}' is an invalid Procore API version`)
    }
  }
}

function client(authorizer: Authorizer, defaults: RequestInit = {}, host: string = hostname): Client {
  return new Client(authorizer, defaults, host)
}

export default client
