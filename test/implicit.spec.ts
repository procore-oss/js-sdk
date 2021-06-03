import { expect } from 'chai'
import { implicit } from '../dist/lib/index'

describe('implicit grant', () => {
  const id = 'a74b52aa6aa06a33c265a8a91738a3a4656a82aa96754a142a446558aa57aaa3'; // This is Fake
  const uri = 'https://www.example.com/callback';

  it('returns valid url', () => {
    expect(implicit({ id, uri })).to.equal(
      `https://app.procore.com/oauth/authorize?response_type=token&client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(uri)}`
    )
  });

  it('returns valid url with custom apiHostname', () => {
    expect(implicit({ id, uri }, { apiHostname: 'https://api.procore.com' })).to.equal(
      `https://api.procore.com/oauth/authorize?response_type=token&client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(uri)}`
    )
  });

  it('returns valid url with apiHostname passed as string', () => {
    expect(implicit({ id, uri }, 'https://api.procore.com')).to.equal(
      `https://api.procore.com/oauth/authorize?response_type=token&client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(uri)}`
    )
  });
})
