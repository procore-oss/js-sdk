import * as fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { token } from './../lib'


const authToken = {
  auth_token: "token",
  refresh_token: "token",
  expires_in: 7200,
  created_at: new Date().getTime()
}

describe('token', () => {
  before(() => {
    fetchMock.post('*', authToken);
  })

  after(fetchMock.restore)

  it('generates an auth token', (done) => {
    token({ id: "clientIdStub", secret: "clientIdStub", code: "codestub", uri: "uri_stub" })
      .then(res => {
        expect(res).to.eql(authToken)

        done()
      })
  })
})
