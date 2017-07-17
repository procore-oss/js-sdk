import { expect } from 'chai'
import { stub, match } from 'sinon'
import { refresher, oauth } from './../lib'

describe('refresher', () => {
  describe('#authorize', () => {
    context('valid token', () => {
      it('passes the request to oauth', () => {
        const token = "token"

        const refreshToken = stub().withArgs(token)

        const request = stub().resolves({ response: { status: 200 } })

        const subject = refresher(oauth(token), refreshToken)

        subject.authorize(request)

        expect(request.calledOnce).to.eql(true)
      })
    })

    context('invalid token', () => {
      it('requests a new token', (done) => {
        const goodToken = 'good'
        const badToken = 'bad'

        const refreshToken = stub().resolves({access_token: goodToken})

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

        subject
          .authorize(requestStub)
          .then((res) => {
            expect(refreshToken.calledOnce).to.eql(true)
            expect(badRequest.calledBefore(goodRequest)).to.eql(true)

            done()
          })
      })
    })
  })
})
