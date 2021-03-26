import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { token } from '../dist/index'

const authToken = {
  auth_token: "token",
  refresh_token: "token",
  expires_in: 7200,
  created_at: new Date().getTime()
}

const truthyCustomHostResponse = {
  success: true,
}

describe('token', () => {
  before(() => {
    fetchMock.mock('*', url =>
      url.indexOf('test.com') !== -1 ? truthyCustomHostResponse : authToken
    );
  });

  after(() => fetchMock.restore());

  it('generates an auth token', async () => {
    const res = await token(
      {
        id: "clientIdStub",
        secret: "clientIdStub",
        code: "codestub",
        uri: "uri_stub"
      });
    expect(res).to.eql(authToken);
  });

  it('generates an auth token with hostname', async () => {
    const res = await token(
      {
        id: "clientIdStub",
        secret: "clientIdStub",
        code: "codestub",
        uri: "uri_stub"
      },
      {
        apiHostname: "test.com"
      })
    expect(res).to.eql(truthyCustomHostResponse)
  });
})
