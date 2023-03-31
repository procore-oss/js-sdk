import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { refresh } from '../lib/index'

const jsonResponse = {
  foo: "bar"
}

const headers = {
  'Content-Type': 'application/json'
};

const body = {
  'grant_type': 'refresh_token',
  'client_id': 'fake_id',
  'client_secret': 'fake_secret',
  'redirect_uri': 'fake_redirect_uri',
  'refresh_token': 'fake_refresh_token'
}

describe('refresh', () => {
  it('refresh token', async () => {
    fetchMock.post({ url: `https://app.procore.com/oauth/token`, headers, body }, jsonResponse);
    const res = await refresh(
      {
        id: 'fake_id',
        secret: 'fake_secret',
        uri: 'fake_redirect_uri',
        refresh: 'fake_refresh_token'
      },
      {}
      );
    expect(res).to.eql(jsonResponse);
    fetchMock.restore();
  });

  it('refresh token with hostname as ClientOptions', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/token`, headers, body }, jsonResponse);
    const res = await refresh(
      {
        id: 'fake_id',
        secret: 'fake_secret',
        uri: 'fake_redirect_uri',
        refresh: 'fake_refresh_token'
      },
      {
        apiHostname: "https://api.procore.com"
      });
    expect(res).to.eql(jsonResponse);
    fetchMock.restore();
  });

  it('refresh token with hostname as string', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/token`, headers, body }, jsonResponse);
    const res = await refresh(
      {
        id: 'fake_id',
        secret: 'fake_secret',
        uri: 'fake_redirect_uri',
        refresh: 'fake_refresh_token'
      },
       "https://api.procore.com");
    expect(res).to.eql(jsonResponse);
    fetchMock.restore();
  });
})
