import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { token } from '../lib/index'

const tokenResponse = {
  auth_token: "token",
  refresh_token: "token",
  expires_in: 7200,
  created_at: new Date().getTime()
}

const headers = {
  'Content-Type': 'application/json'
};

const body = {
  'grant_type': 'authorization_code',
  'code': 'fake_code',
  'client_id': 'fake_id',
  'client_secret': 'fake_secret',
  'redirect_uri': 'fake_redirect_uri',
}

describe('token', () => {
  it('generates an auth token', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/token`, headers, body }, tokenResponse);
    const res = await token(
      {
        id: "fake_id",
        secret: "fake_secret",
        code: "fake_code",
        uri: "fake_redirect_uri"
      },
      {}
      );
    expect(res).to.eql(tokenResponse);
    fetchMock.restore();
  });

  it('generates an auth token with hostname as ClientOptions', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/token`, headers, body }, tokenResponse);
    const res = await token(
      {
        id: "fake_id",
        secret: "fake_secret",
        code: "fake_code",
        uri: "fake_redirect_uri"
      },
      {
        apiHostname: "https://api.procore.com"
      });
    expect(res).to.eql(tokenResponse);
    fetchMock.restore();
  });

  it('generates an auth token with hostname as string', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/token`, headers, body }, tokenResponse);
    const res = await token(
      {
        id: "fake_id",
        secret: "fake_secret",
        code: "fake_code",
        uri: "fake_redirect_uri"
      },
       "https://api.procore.com");
    expect(res).to.eql(tokenResponse);
    fetchMock.restore();
  });
})
