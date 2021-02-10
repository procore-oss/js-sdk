import * as fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { client, oauth } from './../lib'
import hostname from '../lib/hostname'

const project = { id: 3 }

const me = { id: 42, login: "foo@procore.com", name: "foo" }

const rfi = { id: 1, subject: "Create RFI Subject", assignee_id: 2945 }
const idsToDelete = [{ id: 1 }, { id: 2 }]
const token = "token"

describe('client', () => {
  it('uses the custom formatter', (done) => {
    const authorizer = oauth(token)
    const procore = client(authorizer)
    let counter = 1;

    function formatter(response: any) {
      counter += 1;
      return response.json();
    }

    fetchMock.get(`${hostname}/foo/me`, me)
    procore
      .get('/foo/me', { formatter })
      .then(({ body }) => {
        expect(body).to.eql(me)
        expect(counter).to.eql(2)
        fetchMock.restore()
        done()
      })
  })

  context('using oauth', () => {
    describe('request defaults', () => {
      it('sets default request options', (done) => {
        const authorizer = oauth(token)

        const procore = client(authorizer, { credentials: 'omit' })

        fetchMock.get(`${hostname}/rest/v1.0/test_config`, {})

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
        const successResponse = { success: true }

        const options = {
          method: 'GET',
          matcher: function (url, opts) {
            return opts.headers.has('Authorization')
          }
        };

        fetchMock.mock(`${hostname}/rest/v1.1/test_config`, successResponse, options)

        procore
          .get({ base: '/test_config', apiVersion: 'v1.1' })
          .then(({ body }) => {
            expect(body).to.eql(successResponse)

            fetchMock.restore()
            done()
          })
      })

      it('returns the raw request even if the request fails', done => {
        const procore = client(oauth(token))
        const response = {
          status: 401,
          body: { errors: { name: ['is already taken'] } }
        }

        fetchMock.get(`${hostname}/vapid/test_config`, response)

        procore.get({ base: '/test_config', apiVersion: 'vapid' })
          .catch(({ body, response: { status } }) => {
            expect(body).to.eql(response.body)
            expect(status).to.eql(response.status)

            fetchMock.restore()
            done()
          })
      })
    })

    describe('request using apiVersion', () => {
      const authorizer = oauth(token)
      const procore = client(authorizer)

      it('sets default apiVersion when not passing', (done) => {
        fetchMock.get(`${hostname}/rest/v1.0/me`, me)
        procore
            .get({base:'/me', apiVersion: undefined})
            .then(({ body }) => {
              expect(body).to.eql(me)

              fetchMock.restore()

              done()
            })
      })

      it('use default apiVersion when not passing', (done) => {
        fetchMock.get(`${hostname}/rest/v1.0/me`, me)
        procore
            .get({base: '/me'})
            .then(({ body }) => {
              expect(body).to.eql(me)

              fetchMock.restore()

              done()
            })
      })

      it('customize with specified version', (done) => {
        fetchMock.get(`${hostname}/rest/v1.1/me`, me)
        procore
            .get({base: '/me', apiVersion: 'v1.1'})
            .then(({ body }) => {
              expect(body).to.eql(me)

              fetchMock.restore()

              done()
            })
      })

      it('still work for vapid when explicitly passed', (done) => {
        fetchMock.get(`${hostname}/vapid/me`, me)
        procore
            .get({base: '/me', apiVersion: 'vapid'})
            .then(({ body }) => {
              expect(body).to.eql(me)

              fetchMock.restore()

              done()
            })
      })
    })

    describe('#post', () => {
      const authorizer = oauth(token)

      const procore = client(authorizer)

      it('creates a resource', (done) => {
        fetchMock.post(`${hostname}/rest/v1.0/projects/${project.id}/rfis`, rfi)
        procore
          .post({
            base: '/projects/{project_id}/rfis',
            params: { project_id: 3 }
          }, rfi)
          .then(({ body }) => {
            expect(body).to.eql(rfi)

            fetchMock.restore()

            done()
          })
      })

      it('sends a valid body', (done) => {
        fetchMock.post(`${hostname}/rest/v1.0/projects/${project.id}/rfis`, (url, opts: RequestInit) => {
          return opts.body;
        });

        procore
          .post({
            base: '/projects/{project_id}/rfis',
            params: { project_id: 3 }
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
          fetchMock.get(`${hostname}/rest/v1.0/me`, me)

          procore
            .get({ base: '/me', params: {} })
            .then(({ body }) => {
              expect(body).to.eql(me)

              fetchMock.restore()

              done()
            })
        })

        context('using a string url as the endpoint', () => {
          it('gets a signleton resource', (done) => {
            fetchMock.get(`${hostname}/me`, me)

            procore
              .get('/me')
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
          fetchMock.get(`${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, rfi)

          procore
            .get(
              { base: '/projects/{project_id}/rfis', params: { project_id: project.id, id: rfi.id } }
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
          fetchMock.get(`${hostname}/rest/v1.0/projects?a%5B%5D=1&a%5B%5D=2`, rfi)

          procore
            .get(
              { base: '/projects', qs: { a: [1, 2] } }
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
          fetchMock.mock({ response: { body: [], headers: { Total: 500, 'Per-Page': 10 } }, matcher: `${hostname}/rest/v1.0/pagination_test` })

          procore
            .get({ base: '/pagination_test', params: {} })
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
          fetchMock.get(`${hostname}/rest/v1.0/projects/${project.id}/rfis/recycle_bin`, [rfi])

          procore
            .get(
              { base: '/projects/{project_id}/rfis', params: { project_id: project.id }, action: 'recycle_bin' }
            )
            .then(({ body }) => {
              expect(body).to.eql([rfi])

              fetchMock.restore()

              done()
            })

        })
      })
    })

    describe('#delete', () => {
      const authorizer = oauth(token)

      const procore = client(authorizer)

      it('deletes a resource without a body', (done) => {
        fetchMock.delete(`${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, rfi)
        procore
          .destroy({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          })
          .then(({ body }) => {
            expect(body).to.eql(rfi)

            fetchMock.restore()

            done()
          })
      })

      it('deletes resource(s) sent with a body', (done) => {
        fetchMock.delete(`${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, (url, opts: RequestInit) => {
          return { body: opts.body, status: 200 };
        });

        procore
          .destroy({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          }, idsToDelete)
          .then(({ body }) => {
            expect(body).to.eql(idsToDelete)

            fetchMock.restore()

            done()
          })
      })

      it('handles delete with no response: status 204', (done) => {
        fetchMock.delete(`${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, { status: 204 });

        procore
          .destroy({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          })
          .then(({ body }) => {
            expect(body).to.eql({})

            fetchMock.restore()

            done()
          })
      })
    })
  })
})
