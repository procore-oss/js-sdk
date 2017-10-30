import * as fetchMock from 'fetch-mock'
import { stringify } from 'qs'
import { expect } from 'chai'
import { client, oauth, implicit } from './../lib'

const project = { id: 3 }

const me = { id: 42, login: "foo@procore.com", name: "foo" }

const rfi = { id: 1, subject: "Create RFI Subject", assignee_id: 2945 }

const token = "token"

const headers = { 'Authorization': `Bearer ${token}` }

describe('client', () => {
  context('using oauth', () => {
    describe('request defaults', () => {
      it('sets default request options', (done) => {
        const authorizer = oauth(token)

        const procore = client(authorizer, { credentials: 'omit' })

        fetchMock.get(`end:test_config`, {})

        procore
          .get({ base: '/test_config' })
          .then(({ response, request }) => {
            fetchMock.restore()
            done()
          })
      })

      it('allows headers override', (done) => {
        const headers = new Headers()
        const authorizer = oauth(token)
        const procore = client(authorizer, { headers })
        const successResponse = {success: true}

        const options = {
          method: 'GET',
          matcher: function (url, opts) {
            return opts.headers.has('Authorization')
          }
        };

        fetchMock.mock('end:test_config', successResponse, options)

        procore
          .get({ base: '/test_config' })
          .then(({ body }) => {
            expect(body).to.eql(successResponse)

            fetchMock.restore()
            done()
          })
      })
    })

    describe('#post', () => {
      const authorizer = oauth(token)

      const procore = client(authorizer)

      it('creates a resource', (done) => {
        fetchMock.post(`end:projects/${project.id}/rfis`, rfi)
        procore
          .post({
            base: '/vapid/projects/{project_id}/rfis',
            params: { project_id: 3  }
          }, rfi)
          .then(({ body }) => {
            expect(body).to.eql(rfi)

            fetchMock.restore()

            done()
          })
      })

      it('sends a valid body', (done) => {
        fetchMock.post(`end:projects/${project.id}/rfis`, (url, opts: RequestInit) => {
          return opts.body;
        });

        procore
          .post({
            base: '/vapid/projects/{project_id}/rfis',
            params: { project_id: 3  }
          }, rfi)
          .then(({ body }) => {
            expect(body).to.eql(rfi)

            fetchMock.restore()

            done()
          })
      })
    })

    describe('#get', () => {
      const authorizer = oauth(token)

      const procore = client(authorizer)

      describe('singleton', () => {
        it('gets a signleton resource', (done) => {
          fetchMock.get('end:vapid/me', me)

          procore
            .get({ base: '/vapid/me', params: {} })
            .then(({ body }) => {
              expect(body).to.eql(me)

              fetchMock.restore()

              done()
            })
        })

        context('using a string url as the endpoint', () => {
          it('gets a signleton resource', (done) => {
            fetchMock.get('end:vapid/me', me)

            procore
              .get('/vapid/me')
              .then(({ body }) => {
                expect(body).to.eql(me)

                fetchMock.restore()

                done()
              })
          })
        })
      })

      describe('by id', () => {
        it('gets the resource', done => {
          fetchMock.get(`end:vapid/projects/${project.id}/rfis/${rfi.id}`, rfi)

          procore
            .get(
              { base: '/vapid/projects/{project_id}/rfis', params: { project_id: project.id, id: rfi.id } }
            )
            .then(({ body }) => {
              expect(body).to.eql(rfi)

              fetchMock.restore()

              done()
            })
        })
      })

      describe('by query strings', () => {
        it('gets the resource', done => {
          fetchMock.get(`end:vapid/projects?a%5B%5D=1&a%5B%5D=2`, rfi)

          procore
            .get(
              { base: '/vapid/projects', qs: { a: [1, 2] } }
            )
            .then(({ body }) => {
              expect(body).to.eql(rfi)

              fetchMock.restore()

              done()
            })
        })
      })

      describe('pagination', () => {
        it('Total and Per-Page is in response header', (done) => {
          fetchMock.mock({ response: { body: [],  headers: { Total: 500, 'Per-Page': 10 } }, matcher: 'end:vapid/pagination_test' })

          procore
            .get({ base: '/vapid/pagination_test', params: {} })
            .then(({ body, response }) => {
              expect(body).to.eql([])

              expect(response.headers.get('Total')).to.equal('500')

              expect(response.headers.get('Per-Page')).to.equal('10')

              fetchMock.restore()

              done()
            })
        })
      })

      describe('action', () => {
        it('gets the resources', done => {
          fetchMock.get(`end:vapid/projects/${project.id}/rfis/recycle_bin`, [rfi])

          procore
            .get(
              { base: '/vapid/projects/{project_id}/rfis', params: { project_id: project.id }, action: 'recycle_bin' }
            )
            .then(({ body }) => {
              expect(body).to.eql([rfi])

              fetchMock.restore()

              done()
            })

        })
      })
    })
  })
})
