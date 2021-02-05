import { Authorizer } from './interfaces'

interface OauthHeader extends Array<string> { 0: string, 1: string }

function header(token: string): OauthHeader {
  return ['Authorization', `Bearer ${token}`]
}

export class OauthAuthorizer implements Authorizer {
  private token: string;

  constructor(token: string) {
    this.token = token
  }

  public authorize = (request: Function): Promise<any> => request(header(this.token))

  public setToken = (token: string): void => {
    this.token = token
  }

  public getToken = (): string => this.token
}

function oauth(token: string): OauthAuthorizer {
  return new OauthAuthorizer(token)
}

export default oauth
