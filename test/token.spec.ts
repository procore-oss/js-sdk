import * as fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { token } from '../lib/index'

const authToken = {
  auth_token: "token",
  refresh_token: "token",
  expires_in: 7200,
  created_at: new Date().getTime()
}

const truthyCustomHostResponse = {
  success: true,
}

describe('token', () => {
  before(() => {
    fetchMock.mock('*', (url, opts) => {
      return url.indexOf('test.com') !== -1 ? truthyCustomHostResponse : authToken
    });
  })

  after(fetchMock.restore)

  it('generates an auth token', (done) => {
    token({ id: "clientIdStub", secret: "clientIdStub", code: "codestub", uri: "uri_stub" })
      .then(res => {
        expect(res).to.eql(authToken)

        done()
      })
  })

  it('generates an auth token with hostname', (done) => {
    token({ id: "clientIdStub", secret: "clientIdStub", code: "codestub", uri: "uri_stub" }, { apiHostname: "test.com" })
      .then(res => {
        expect(res).to.eql(truthyCustomHostResponse)

        done()
      })
  })
})
