import { Authorizer } from './interfaces'

class Csrf implements Authorizer {
  public authorize(request: Function): Promise<any> {
    return request(['X-CSRF-TOKEN', getTokenFromCookie()])
  }
}

function csrf(): Csrf {
  return new Csrf()
}

function getTokenFromCookie() {
  let token = document.cookie.match('(^|;)\\s*csrf_token\\s*=\\s*([^;]+)');
  return token ? decodeURIComponent(token.pop()) : '';
}

export default csrf
