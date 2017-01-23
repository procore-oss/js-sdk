interface OauthCredential {
  clientId: string,
  clientSecret: string
}

interface Authorization {
  token: string,
  expiration: string,
  refresh: string
}

function authenticate(credintials: OauthCredential): any {

}

export default authenticate;
