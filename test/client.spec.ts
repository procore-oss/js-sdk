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
  afterEach(fetchMock.restore)

  context('using oauth', () => {
    describe('#post', () => {

      beforeEach(() => {
        fetchMock.post(`end:projects/${project.id}/rfis`, rfi)
      })

      const authorizer = oauth(token)

      const procore = client(authorizer)

      it('creates a resource', (done) => {
        procore
          .post({
            base: '/vapid/projects/{project_id}/rfis',
            params: { project_id: 3  }
          }, rfi)
          .then(({ body }) => {
            expect(body).to.eql(rfi)
            done()
          })
      })
    })

    describe('#get', () => {
      const authorizer = oauth(token)

      const procore = client(authorizer)

      describe('singleton', () => {
        beforeEach(() => {
          fetchMock.get('end:vapid/me', me)
        })

        it('gets a signleton resource', (done) => {
          procore
            .get({ base: '/vapid/me', params: {} })
            .then(({ body }) => {
              expect(body).to.eql(me)

              done()
            })
        })
      })

      describe('by id', () => {
        beforeEach(() => {
          fetchMock.get(`end:vapid/projects/${project.id}/rfis/${rfi.id}`, rfi)
        })

        it('gets the resource', done => {
          procore
            .get(
              { base: '/vapid/projects/{project_id}/rfis', params: { project_id: project.id, id: rfi.id } }
            )
            .then(({ body }) => {
              expect(body).to.eql(rfi)

              done()
            })
        })
      })

      describe('action', () => {
        beforeEach(() => {
          fetchMock.get(`end:vapid/projects/${project.id}/rfis/recycle_bin`, [rfi])
        })

        it('gets the resources', done => {
          procore
            .get(
              { base: '/vapid/projects/{project_id}/rfis', params: { project_id: project.id }, action: 'recycle_bin' }
            )
            .then(({ body }) => {
              expect(body).to.eql([rfi])

              done()
            })

        })
      })
    })
  })
})
