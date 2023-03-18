import { Authorizer } from './interfaces'

class Csrf implements Authorizer {
  public getToken: Function;
  public csrfHeader: String;

  constructor(csrfHeader?: String, getToken?: Function) {
    this.getToken = getToken || Csrf.getTokenDefault;
    this.csrfHeader = csrfHeader || 'X-CSRF-TOKEN';
    this.authorize = this.authorize.bind(this);
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
    const cookieCsrf = document.cookie.match(/(?:^|;)\s*csrf_token\s*=\s*([^;]+)/);
    if (cookieCsrf) {
      return decodeURIComponent(cookieCsrf.pop());
    }

    const metaCsrf = document
      .querySelector('meta[name="csrf-token"]')!
      .getAttribute('content');
    return (metaCsrf !== undefined && metaCsrf !== null && metaCsrf.length > 0) ? metaCsrf : '';
  }
}

function csrf(csrfHeader?: String, getToken?: Function): Csrf {
  return new Csrf(csrfHeader, getToken);
}

export default csrf;
