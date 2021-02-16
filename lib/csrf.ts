import { Authorizer } from './interfaces'

class Csrf implements Authorizer {
  public getToken: Function;
  public csrfHeader: String;

  constructor(csrfHeader?: String, getToken?: Function) {
    this.getToken = getToken || Csrf.getTokenDefault;
    this.csrfHeader = csrfHeader || 'X-CSRF-TOKEN';
  }

  public authorize(request: Function): Promise<any> {
    return request([this.csrfHeader, this.getToken()]);
  }

  // Default location to search for csrf-token is
  // <head>
  //   <meta name="csrf-token" content="{{ csrf_token() }}">
  // </head>
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
  private static getTokenDefault(): String {
    return window.document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  }
}

function csrf(csrfHeader?: String, getToken?: Function ): Csrf {
  return new Csrf(csrfHeader, getToken);
}

export default csrf;
