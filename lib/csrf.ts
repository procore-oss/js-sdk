import { Authorizer } from './interfaces'

class Csrf implements Authorizer {
  public authorize(request: Function): Promise<any> {
    return request(['X-CSRF-TOKEN', window.document.head.querySelector("[value=csrf-token]").getAttribute('content')])
  }
}

function csrf(): Csrf {
  return new Csrf()
}

export default csrf
