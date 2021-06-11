import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { info } from '../dist/index'

const token = 'token';
const infoResponse = {
  "resource_owner_id": 5960067,
  "scopes": [],
  "expires_in_seconds": 7193,
  "application": {
    "uid": "a74a52da6aa06a33a265a8a91738a3a4656a82aa96754a142a446558aa57aaa3"
  },
  "created_at": 1616714020
};
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

describe('info', () => {
  it('request', async () => {
    fetchMock.get({ url: `https://app.procore.com/oauth/token/info`, headers }, infoResponse);
    const body = await info(token);
    expect(body).to.deep.equal(infoResponse);
    fetchMock.restore();
  });

  it('request using ClientOptions', async () => {
    fetchMock.get({ url: `https://api.procore.com/oauth/token/info`, headers }, infoResponse);
    const body = await info(token, { apiHostname: 'https://api.procore.com' });
    expect(body).to.deep.equal(infoResponse);
    fetchMock.restore();
  });

  it('request using string for options', async () => {
    fetchMock.get({ url: `https://api.procore.com/oauth/token/info`, headers }, infoResponse);
    const body = await info(token, 'https://api.procore.com');
    expect(body).to.deep.equal(infoResponse);
    fetchMock.restore();
  });
})
