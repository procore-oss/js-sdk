import { expect } from 'chai'
import { stub } from 'sinon'
import { refresher, oauth } from './../lib'

describe('refresher', () => {
  describe('#authorize', () => {
    context('valid token', () => {
      it('passes the request to oauth', () => {
        const token = "token"

        const refreshToken = stub().withArgs(token)

        const request = stub().returns(stub({ catch: () => {} }))

        const subject = refresher(oauth(token), refreshToken)

        subject.authorize(request)

        expect(request.calledOnce).to.eql(true)
      })
    })

    context('invalid token', () => {
      it('requests a new token', () => {
      })
    })
  })
})
