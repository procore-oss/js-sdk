import { spy } from 'sinon'
import { csrf } from '../lib/index'
import { expect } from 'chai'

describe('csrf', () => {

  describe('#authorize', () => {
    it('provides csrf token header with custom getToken function for the request', (done) => {
      const getToken = () => 'fake_token';
      const authorizer = csrf('X-CSRF-TOKEN', getToken);
      const request = spy();

      authorizer.authorize(request);
      
      expect(request.calledWith(['X-CSRF-TOKEN', 'fake_token'])).to.eql(true);
      done();
    });

    it('provides csrf token header with custom csrf header name and getToken function for the request', (done) => {
      const getToken = () => 'fake_token';
      const authorizer = csrf('anti-csrf-token', getToken);
      const request = spy();

      authorizer.authorize(request);
      
      expect(request.calledWith(['anti-csrf-token', 'fake_token'])).to.eql(true);
      done();
    });

  });
})
