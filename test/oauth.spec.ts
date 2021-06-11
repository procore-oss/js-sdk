import { spy } from 'sinon'
import { expect } from 'chai'
import { oauth } from '../dist/lib/index'

describe('oauth', () => {
  const token = "fake_token";
  const authorizer = oauth(token);

  describe('#authorize', () => {
    it('provides token header for the request', async () => {
      const request = spy();
      await authorizer.authorize(request);
      expect(request.calledWith(['Authorization', 'Bearer fake_token'])).to.eql(true);
    })
  })

  describe('#getToken', () => {
    it('returns the current token', () => {
      expect(authorizer.getToken()).to.eql(token);
    })
  })

  describe('#setToken', () => {
    it('sets the auth token', () => {
      const nextToken = "next_token";
      authorizer.setToken(nextToken);
      expect(authorizer.getToken()).to.eql(nextToken);
    })
  })
})
