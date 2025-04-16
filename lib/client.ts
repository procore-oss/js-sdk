import 'isomorphic-fetch'
import { stringify } from 'qs'
import { Authorizer } from './interfaces'
import { ClientOptions, convert } from './clientOptions'
import { sdkVersionHeader } from './sdkVersion'

export interface EndpointConfig {
  base: string;
  version?: string;
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
  if (response.body !== undefined && response.body !== null) {
    return response.json();
  }
  return Promise.resolve({});
}

const baseRequest = (defaults: RequestInit, options: ClientOptions): Function => (url: string, config: RequestInit, reqConfig?: RequestConfig): Function => {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-Type', 'application/json');
  headers.append('Procore-Sdk-Version', sdkVersionHeader);
  headers.append('Procore-Sdk-language', 'javascript');

  if (reqConfig?.companyId) {
    headers.append('Procore-Company-Id', `${reqConfig.companyId}`);
  } else if (options?.defaultCompanyId) {
    headers.append('Procore-Company-Id', `${options.defaultCompanyId}`);
  }

  if (config.headers) {
    if (config.headers instanceof Headers) {
      config.headers.forEach((value, name) => {
        headers.set(name, value);
      });
    } else if (config.headers) {
      Object.getOwnPropertyNames(config.headers).forEach((name) => {
        headers.set(name, config.headers[name]);
      })
    }
  }

  let opts: RequestInit & {headers: Headers} = { mode: 'cors', credentials: 'include', ...defaults, ...config, headers };

  return async function authorizedRequest([authKey, authValue]: Array<string>): Promise<SDKResponse> {
    opts.headers.set(authKey, authValue);

    // Add custom headers if provided in RequestConfig
    if (reqConfig?.headers) {
      Object.keys(reqConfig.headers).forEach((key) => {
        opts.headers.set(key, reqConfig.headers[key]);
      });
    }

    const formatter =
      reqConfig && reqConfig.formatter ? reqConfig.formatter : defaultFormatter;
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
  companyId?: string | number;
  headers?: {[key: string]: string};
}

export class Client {
  private readonly options: ClientOptions;
  private authorize: any;
  private request: Function;

  constructor(authorizer: Authorizer, config: RequestInit = {}, options: ClientOptions) {
    this.authorize = authorizer.authorize;
    this.options = options;
    this.request = baseRequest(config, options);
  }

  public get = (endpoint: Endpoint, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'GET' }, reqConfig))

  public post = (endpoint: Endpoint, payload: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'POST', body: JSON.stringify(payload) }, reqConfig))

  public patch = (endpoint: Endpoint, payload: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'PATCH', body: JSON.stringify(payload) }, reqConfig))

  public put = (endpoint: Endpoint, payload: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'PUT', body: JSON.stringify(payload) }, reqConfig))

  public delete = (endpoint: Endpoint, payload?: any, reqConfig?: RequestConfig): Promise<any> =>
    this.authorize(this.request(this.url(endpoint), { method: 'DELETE', body: JSON.stringify(payload) }, reqConfig))

  private url = (endpoint: Endpoint): string =>
    notNil(endpoint) && (endpoint.constructor === String || endpoint instanceof String) ?
      `${this.options.apiHostname}${endpoint}` :
      this.urlConfig(endpoint as EndpointConfig);

  private urlConfig = ({ base, action, params = {}, qs, version }: EndpointConfig): string => {
    let url: string;

    if (this.version(version) === '') {
      url = `${this.options.apiHostname}${replaceParams(base, params)}`;
    } else {
      url = `${this.options.apiHostname}/${this.version(version)}${replaceParams(base, params)}`;
    }

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

  private version = (version: string = this.options.defaultVersion): string => {
    if (version === 'unversioned') {
      return ''; // no prefix
    }

    const [, restVersion = undefined] = version.match(/^(v[1-9]\d*\.\d+)$/) || [];
    const [, vapidVersion = undefined] = version.match(/^(vapid)\/?$/) || [];

    if (restVersion) {
      return `rest/${restVersion}`;
    } else if (vapidVersion) {
      return vapidVersion;
    } else {
      throw new Error(`'${version}' is an invalid Procore API version`);
    }
  }
}

function client(authorizer: Authorizer, defaults: RequestInit = {}, options: ClientOptions | string): Client {
  return new Client(authorizer, defaults, convert(options));
}

export default client
