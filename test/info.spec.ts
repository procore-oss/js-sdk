import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { info } from '../dist/index'
import { ClientOptionsDefaults } from '../dist/clientOptions'

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
const hostname = ClientOptionsDefaults.apiHostname;

describe('info', () => {
  it('basic request', async () => {
    fetchMock.get({ url: `${hostname}/oauth/token/info`, headers }, infoResponse);
    const body = await info(token);
    expect(body).to.deep.equal(infoResponse);
    fetchMock.restore();
  });
})
