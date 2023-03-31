import { expect } from 'chai'
import { stub, match } from 'sinon'
import { refresher, oauth } from '../lib/index'

describe('refresher', () => {
  describe('#authorize', () => {
    context('valid token', () => {
      it('passes the request to oauth', async () => {
        const token = "token";
        const refreshToken = stub().withArgs(token);

        const request = stub().resolves({ response: { status: 200 } });

        const subject = refresher(oauth(token), refreshToken);

        await subject.authorize(request);

        expect(request.calledOnce).to.eql(true);
      })
    })

    context('invalid token', () => {
      it('requests a new token', async () => {
        const goodToken = 'good'
        const badToken = 'bad'

        const refreshToken = stub().resolves({ access_token: goodToken })

        const requestStub = stub()
        const badRequest = requestStub.withArgs(
          match(['Authorization', `Bearer ${badToken}`])
        )
        const goodRequest = requestStub.withArgs(
          match(['Authorization', `Bearer ${goodToken}`])
        )

        badRequest.rejects({ response: { status: 401 } })
        goodRequest.resolves({ response: { status: 200 } })

        const subject = refresher(oauth(badToken), refreshToken)

        await subject.authorize(requestStub);

        expect(refreshToken.calledOnce).to.eql(true)
        expect(badRequest.calledBefore(goodRequest)).to.eql(true)
      })
    })
  })
})
