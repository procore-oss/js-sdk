import fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { client, oauth, sdkVersionHeader } from '../dist/index'

const company = { id: 4 };
const project = { id: 3 };
const me = { id: 42, login: 'foo@procore.com', name: 'foo' };
const rfi = { id: 1, subject: 'Create RFI Subject', assignee_id: 2945 };
const idsToDelete = [{ id: 1 }, { id: 2 }];
const token = 'token';
const hostname = 'https://app.procore.com';
const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Procore-Sdk-Version': sdkVersionHeader,
  'Procore-Sdk-Language': 'javascript',
};

describe('client', () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  context('Override fetch', () => {
    it('uses a custom formatter', async () => {
      const authorizer = oauth(token);
      const procore = client(authorizer);
      let counter = 1;

      function formatter(response: any) {
        counter += 1;
        return response.json();
      }

      fetchMock.get(`${hostname}/foo/me`, me);

      const { body } = await procore.get('/foo/me', { formatter });

      expect(body).to.eql(me);
      expect(counter).to.eql(2);
      fetchMock.restore();
    });

    it('sets company id header', async () => {
      const authorizer = oauth(token);
      const procore = client(authorizer, { headers: { ...headers } });

      const customHeaders = {
        'Procore-Company-Id': `${company.id}`,
      };

      fetchMock.get(
        {
          url: `${hostname}/foo/projects`,
          headers: {
            ...headers,
            ...customHeaders,
          },
        },
        project
      );

      const { body } = await procore.get('/foo/projects', {
        companyId: company.id
      });

      expect(body).to.eql(project);
      fetchMock.restore();
    });

    it('uses a custom header', async () => {
      const authorizer = oauth(token);
      const procore = client(authorizer, { headers: { ...headers } });

      const customHeaders = {
        'Procore-Company-Id': `${company.id}`,
      };

      fetchMock.get(
        {
          url: `${hostname}/foo/projects`,
          headers: {
            ...headers,
            ...customHeaders,
          },
        },
        project
      );

      const { body } = await procore.get('/foo/projects', {
        headers: {
          ...customHeaders,
        },
      });

      expect(body).to.eql(project);
      fetchMock.restore();
    });
  });

  context('using oauth', () => {
    describe('request defaults', () => {
      it('sets default request options', async () => {
        const authorizer = oauth(token);
        const procore = client(authorizer, { credentials: 'omit' })

        fetchMock.get(`${hostname}/rest/v1.0/test_config`, {});

        const { body } = await procore.get({ base: '/test_config' });
        expect(body).to.eql({});
        fetchMock.restore();
      })

      it('allows response headers override', async () => {
        const headers = new Headers();
        const authorizer = oauth(token);
        const procore = client(authorizer, { headers });
        const successResponse = { success: true };

        fetchMock.get(`${hostname}/rest/v1.0/test_config`, successResponse);

        const { body, response } = await procore.get({ base: '/test_config' });
        expect(body).to.eql(successResponse);

        // Why does adding a headers object as a default remove the Authorization header?
        expect(response.headers.has('Authorization')).to.equal(false);

        fetchMock.restore();
      })

      it('returns the raw request even if the request fails', async () => {
        const procore = client(oauth(token));
        const response = {
          status: 401,
          body: { errors: { name: ['is already taken'] } }
        };

        fetchMock.get(`${hostname}/vapid/test_config`, response);

        await procore.get({ base: '/test_config', version: 'vapid' })
          .catch(({ body, response: { status } }) => {
            expect(body).to.eql(response.body);
            expect(status).to.eql(response.status);

            fetchMock.restore();
          })
      })
    })

    describe('request using version', () => {
      const authorizer = oauth(token);
      const procore = client(authorizer);

      it('sets default version when not passing', async () => {
        fetchMock.get(`${hostname}/rest/v1.0/me`, me);

        const { body } = await procore.get({ base: '/me', version: undefined });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('use default version when not passing', async () => {
        fetchMock.get(`${hostname}/rest/v1.0/me`, me);

        const { body } = await procore.get({ base: '/me' });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('customize with specified version', async () => {
        fetchMock.get(`${hostname}/rest/v1.1/me`, me);

        const { body } = await procore.get({ base: '/me', version: 'v1.1' });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('still work for vapid when explicitly passed', async () => {
        fetchMock.get(`${hostname}/vapid/me`, me);

        const { body } = await procore.get({ base: '/me', version: 'vapid' });
        expect(body).to.eql(me);

        fetchMock.restore();
      })
    })

    describe('request using ClientOptions', () => {
      const authorizer = oauth(token)

      it('overrides apiHostname with passed default', async () => {
        const procore = client(authorizer, undefined, { apiHostname: 'https://api.procore.com' });
        fetchMock.get(`https://api.procore.com/rest/v1.0/me`, me);

        const { body } = await procore.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides version with passed default', async () => {
        const procore = client(authorizer, undefined, { defaultVersion: 'vapid' });
        fetchMock.get(`${hostname}/vapid/me`, me);

        const { body } = await procore.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides both apiHostname and version with passed defaults', async () => {
        const procore = client(authorizer, undefined, { apiHostname: 'https://api.procore.com', defaultVersion: 'vapid' });
        fetchMock.get(`https://api.procore.com/vapid/me`, me);

        const { body } = await procore.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides apiHostname with passed default and uses version passed in .get', async () => {
        const procore = client(authorizer, undefined, { apiHostname: 'https://api.procore.com', defaultVersion: 'vapid' });
        fetchMock.get(`https://api.procore.com/rest/v1.1/me`, me);

        const { body } = await procore.get({ base: '/me', version: 'v1.1' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides apiHostname with passed default as string', async () => {
        const procore = client(authorizer, undefined, 'https://api.procore.com');
        fetchMock.get(`https://api.procore.com/rest/v1.0/me`, me);

        const { body } = await procore.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });
    })

    describe('#post', () => {
      const authorizer = oauth(token);
      const procore = client(authorizer);

      it('creates a resource', async () => {
        fetchMock.post(
          { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis`, headers: headers }, rfi);

        const { body } = await procore
          .post({
            base: '/projects/{project_id}/rfis',
            params: { project_id: 3 }
          }, rfi);
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('sends a valid body', async () => {
        fetchMock.post(
          { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis`, headers: headers }, (url, opts: RequestInit) => {
            return opts.body;
          });

        const { body } = await procore
          .post({
            base: '/projects/{project_id}/rfis',
            params: { project_id: 3 }
          }, rfi);
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })
    })

    describe('#get', () => {
      const authorizer = oauth(token);
      const procore = client(authorizer);

      describe('singleton', () => {
        it('gets a signleton resource', async () => {
          fetchMock.get({ url: `${hostname}/rest/v1.0/me`, headers: headers }, me);

          const { body } = await procore.get({ base: '/me', params: {} });
          expect(body).to.eql(me);

          fetchMock.restore();
        })

        context('using a string url as the endpoint', () => {
          it('gets a signleton resource', async () => {
            fetchMock.get({ url: `${hostname}/me`, headers: headers }, me);

            const { body } = await procore.get('/me');
            expect(body).to.eql(me);

            fetchMock.restore();
          })
        })
      })

      describe('by id', () => {
        it('gets the resource', async () => {
          fetchMock.get(
            { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, rfi);

          const { body } = await procore
            .get(
              { base: '/projects/{project_id}/rfis', params: { project_id: project.id, id: rfi.id } }
            );
          expect(body).to.eql(rfi);

          fetchMock.restore();
        })
      })

      describe('by query strings', () => {
        it('gets the resource', async () => {
          fetchMock.get(
            { url: `${hostname}/rest/v1.0/projects?a%5B%5D=1&a%5B%5D=2`, headers: headers }, rfi);

          const { body } = await procore
            .get(
              { base: '/projects', qs: { a: [1, 2] } }
            );
          expect(body).to.eql(rfi);

          fetchMock.restore();
        })
      })

      describe('pagination', () => {
        it('Total and Per-Page is in response header', async () => {
          fetchMock.get(
            { url: `${hostname}/rest/v1.0/pagination_test`, headers: headers }, { body: [], headers: { Total: 500, 'Per-Page': 10 } });

          const { body, response } = await procore.get({ base: '/pagination_test', params: {} });
          expect(body).to.eql([]);
          expect(response.headers.get('Total')).to.equal('500');
          expect(response.headers.get('Per-Page')).to.equal('10');

          fetchMock.restore();
        })
      })

      describe('action', () => {
        it('gets the resources', async () => {
          fetchMock.get(
            { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis/recycle_bin`, headers: headers }, [rfi]);

          const { body } = await procore
            .get(
              { base: '/projects/{project_id}/rfis', params: { project_id: project.id }, action: 'recycle_bin' }
            );
          expect(body).to.eql([rfi]);

          fetchMock.restore();
        })
      })
    })

    describe('#delete', () => {
      const authorizer = oauth(token)

      const procore = client(authorizer)

      it('deletes a resource without a body', async () => {
        fetchMock.delete(
          { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, rfi);

        const { body } = await procore
          .delete({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          });
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('deletes resource(s) sent with a body', async () => {
        fetchMock.delete(
          { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, (url, opts: RequestInit) => {
            return { body: opts.body, status: 200 };
          });

        const { body } = await procore
          .delete({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          }, idsToDelete);
        expect(body).to.eql(idsToDelete);

        fetchMock.restore();
      })

      it('handles delete with no response: status 204', async () => {
        fetchMock.delete(
          { url: `${hostname}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, { status: 204 });

        const { body } = await procore
          .delete({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: project.id, rfi_id: rfi.id }
          });

        expect(body).to.eql({});
        fetchMock.restore();
      })
    })
  })
})
