import { expect } from 'chai'
import { implicit } from './../lib'

describe('implicit grant', () => {
  it('returns valid oauth url', () => {
    const id = 'foo';
    const uri = 'example.com/redirect';
    expect(implicit({ id, uri })).to.equal(
      `https://app.procore.com/oauth/authorize?response_type=token&client_id=${id}&redirect_uri=${uri}`
     )
  })
})
