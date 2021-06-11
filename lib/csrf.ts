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

  // 1) Look for csrf_token cookie
  // "csrf_token={{ csrf_token() }}; Path=/; Domain=.procore.com; SameSite=Strict; Secure=true;"
  // 2) Look for csrf-token meta tag
  // <head>
  //   <meta name="csrf-token" content="{{ csrf_token() }}">
  // </head>
  // 3) Return ""
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
  private static getTokenDefault(): String {
    const cookieToken = document.cookie.match(/(?:^|;)\s*csrf_token\s*=\s*([^;]+)/);
    if (cookieToken) {
      return decodeURIComponent(cookieToken[cookieToken.length - 1]);
    }

    const metaTokenCtr = window.document.querySelector('meta[name="csrf-token"]');
    return (metaTokenCtr && metaTokenCtr.getAttribute('content')) || '';
  }
}

function csrf(csrfHeader?: String, getToken?: Function): Csrf {
  return new Csrf(csrfHeader, getToken);
}

export default csrf;
