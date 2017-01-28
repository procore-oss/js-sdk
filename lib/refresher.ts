import 'isomorphic-fetch'
import { OauthAuthorizer } from './oauth'

class Refresher {
  private oauth: OauthAuthorizer;
  private refresh: Function;

  constructor(oauth, refresh) {
    this.oauth = oauth
    this.refresh = refresh
  }

  public authorize = (request: Function): Promise<any> => {
    const self = this

    return self.oauth.authorize(request)
      .catch(() => self.refresh(self.oauth.getToken())
        .then(({ auth_token }: any) => {
          self.oauth.setToken(auth_token)

          return self.oauth.authorize(request)
        })
      )
  }
}

function refresher(oauth: OauthAuthorizer, refreshToken: Function) {
  return new Refresher(oauth, refreshToken)
}

export default refresher
