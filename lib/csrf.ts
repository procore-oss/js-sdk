import { Authorizer } from './interfaces'

class Csrf implements Authorizer {
  public getToken: Function;
  public csrfHeader: String;

  constructor(csrfHeader?: String, getToken?: Function) {
    this.getToken = getToken || Csrf.getTokenFromCookie
    this.csrfHeader = csrfHeader || 'X-CSRF-TOKEN'
  }

  public authorize(request: Function): Promise<any> {
    return request([this.csrfHeader, this.getToken()])
  }

  private static getTokenFromCookie(): String {
    var token = document.cookie.match('(^|;)\\s*csrf_token\\s*=\\s*([^;]+)');
    return token ? decodeURIComponent(token.pop()) : '';
  }
}

function csrf(csrfHeader?: String, getToken?: Function ): Csrf {
  return new Csrf(csrfHeader, getToken)
}

export default csrf
