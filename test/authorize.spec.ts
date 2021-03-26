import { expect } from 'chai'
import { authorize } from '../dist/index'

describe('authorize grant', () => {
  const clientId = 'a74b52aa6aa06a33c265a8a91738a3a4656a82aa96754a142a446558aa57aaa3'; // This is Fake
  const uri = 'https://www.example.com/callback';
  it('returns valid url', () => {
    expect(authorize({ clientId, uri })).to.equal(
      `https://app.procore.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(uri)}`
    )
  });

  it('returns valid url with custom apiHostname', () => {
    expect(authorize({ clientId, uri }, { apiHostname: 'https://api.procore.com' })).to.equal(
      `https://api.procore.com/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(uri)}`
    )
  });
})
