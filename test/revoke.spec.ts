import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { revoke } from '../dist/index'

const someJson = {
  foo: 'bar',
}

const headers = {
  'Content-Type': 'application/json'
};

const body = {
  'token': 'fake_token',
  'client_id': 'fake_clientid',
  'client_secret': 'fake_secret'
}

describe('revoke', () => {
  it('revokes a token', async () => {
    fetchMock.post({ url: `https://app.procore.com/oauth/revoke`, headers, body }, someJson);
    const res = await revoke(
      {
        token: 'fake_token',
        clientId: 'fake_clientid',
        clientSecret: 'fake_secret'
      });
    expect(res).to.eql(someJson);
    fetchMock.restore();
  });

  it('revokes token with hostname as ClientOptions', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/revoke`, headers, body }, someJson);
    const res = await revoke(
      {
        token: 'fake_token',
        clientId: 'fake_clientid',
        clientSecret: 'fake_secret'
      },
      {
        apiHostname: "https://api.procore.com"
      });
    expect(res).to.eql(someJson);
    fetchMock.restore();
  });

  it('revokes token with hostname as string', async () => {
    fetchMock.post({ url: `https://api.procore.com/oauth/revoke`, headers, body }, someJson);
    const res = await revoke(
      {
        token: 'fake_token',
        clientId: 'fake_clientid',
        clientSecret: 'fake_secret'
      },
      "https://api.procore.com");
    expect(res).to.eql(someJson);
    fetchMock.restore();
  });
})
