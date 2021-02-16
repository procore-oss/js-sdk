import { spy } from 'sinon'
import { csrf } from '../lib/index'
import { expect } from 'chai'

describe('csrf', () => {

  describe('#authorize', () => {
    it('provides token header for the request', () => {
      const getToken = () => 'fake_token';
      const authorizer = csrf('X-CSRF-TOKEN', getToken);
      const request = spy()

      authorizer.authorize(request)
      
      expect(request.calledWith(['X-CSRF-TOKEN', 'fake_token'])).to.eql(true)
    })
  })
})
