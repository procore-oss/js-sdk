import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import * as sdk from '../lib/index'
import fetchMock from 'fetch-mock'

interface Global {
  document?: Document;
  window?: Window;
}

declare const global: Global;

const company = { id: 4 };
const project = { id: 3 };
const me = { id: 42, login: 'foo@procore.com', name: 'foo' };
const rfi = { id: 1, subject: 'Create RFI Subject', assignee_id: 2945 };
const idsToDelete = [{ id: 1 }, { id: 2 }];
const token = 'token';
const HOSTNAME = 'https://app.procore.com';
const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Procore-Sdk-Version': sdk.sdkVersionHeader,
  'Procore-Sdk-Language': 'javascript',
};

describe('client', () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  context('Override fetch', () => {
    it('uses a custom formatter', async () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, {}, {});
      let counter = 1;

      function formatter(response: any) {
        counter += 1;
        return response.json();
      }

      fetchMock.get(`${HOSTNAME}/foo/me`, me);

      const { body } = await client.get('/foo/me', { formatter });

      expect(body).to.eql(me);
      expect(counter).to.eql(2);
      fetchMock.restore();
    });

    it('sets company id header using clientOptions', async () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, { headers: { ...headers } }, { defaultCompanyId: company.id });

      const customHeaders = {
        'Procore-Company-Id': `${company.id}`,
      };

      fetchMock.get(
        {
          url: `${HOSTNAME}/foo/projects`,
          headers: {
            ...headers,
            ...customHeaders,
          },
        },
        project
      );

      const { body } = await client.get('/foo/projects');

      expect(body).to.eql(project);
      fetchMock.restore();
    });

    it('request using csrf as authorizer with csrf-token in meta tag', async () => {
      try {
        const CSRF_TOKEN = 'TbG95RTOHyFZ1356swct6HX1CqeLMSRLAxsBSydJDKAR1q/LtW6fJziqvbyq0iyVhujaaadj09OjvcuYgDWeTg==';
        const { window } = new JSDOM(
          `<!doctype html><html><head><meta name="csrf-token" content="${CSRF_TOKEN}"></head></html>`,
          {
            url: "https://app.procore.com"
          }
        );
        global.document = window._document;
        global.window = window;

        const client = sdk.client(sdk.csrf(), {}, { apiHostname: HOSTNAME });

        fetchMock.get(
          {
            url: `${HOSTNAME}/rest/v1.0/gmm/projects`,
            headers: {
              ...headers,
            },
          },
          project
        );

        const args = {
          base: '/gmm/projects',
          version: 'v1.0',
        };

        const reqConfig = {
          companyId: company.id
        };

        const { body } = await client.get(args, reqConfig);

        expect(body).to.eql(project);

      } finally {
        // Clean up
        fetchMock.restore();
        delete global.document;
        delete global.window;
      }
    });

    it('request using csrf as authorizer with csrf_token in cookie', async () => {
      try {
        const CSRF_TOKEN = 'TbG95RTOHyFZ1356swct6HX1CqeLMSRLAxsBSydJDKAR1q/LtW6fJziqvbyq0iyVhujaaadj09OjvcuYgDWeTg==';
        const { window } = new JSDOM(
          '<!doctype html><html></html>',
          {
            url: "https://app.procore.com",
            cookieJar: { getCookieStringSync: () => `csrf_token=${encodeURIComponent(CSRF_TOKEN)}; domain=.procore.com; path=/; secure; SameSite=Strict` }
          }
        );
        global.document = window._document;
        global.window = window;

        const client = sdk.client(sdk.csrf(), {}, { apiHostname: HOSTNAME });

        fetchMock.get(
          {
            url: `${HOSTNAME}/rest/v1.0/gmm/projects`,
            headers: {
              ...headers,
            },
          },
          project
        );

        const args = {
          base: '/gmm/projects',
          version: 'v1.0',
        };

        const reqConfig = {
          companyId: company.id
        };

        const { body } = await client.get(args, reqConfig);

        expect(body).to.eql(project);

      } finally {
        // Clean up
        fetchMock.restore();
        delete global.document;
        delete global.window;
      }
    });

    it('sets company id header using requestConfig', async () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, { headers: { ...headers } }, {});

      const customHeaders = {
        'Procore-Company-Id': `${company.id}`,
      };

      fetchMock.get(
        {
          url: `${HOSTNAME}/foo/projects`,
          headers: {
            ...headers,
            ...customHeaders,
          },
        },
        project
      );

      const { body } = await client.get('/foo/projects', {
        companyId: company.id
      });

      expect(body).to.eql(project);
      fetchMock.restore();
    });

    it('sets company id header using requestConfig with different clientOptions', async () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, { headers: { ...headers } }, { defaultCompanyId: 6765 });

      const customHeaders = {
        'Procore-Company-Id': `${company.id}`,
      };

      fetchMock.get(
        {
          url: `${HOSTNAME}/foo/projects`,
          headers: {
            ...headers,
            ...customHeaders,
          },
        },
        project
      );

      const { body } = await client.get('/foo/projects', {
        companyId: company.id
      });

      expect(body).to.eql(project);
      fetchMock.restore();
    });

    it('uses a custom header', async () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, { headers: { ...headers } }, {});

      const customHeaders = {
        'Procore-Company-Id': `${company.id}`,
      };

      fetchMock.get(
        {
          url: `${HOSTNAME}/foo/projects`,
          headers: {
            ...headers,
            ...customHeaders,
          },
        },
        project
      );

      const { body } = await client.get('/foo/projects', {
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
        const authorizer = sdk.oauth(token);
        const client = sdk.client(authorizer, { credentials: 'omit' }, {})

        fetchMock.get(`${HOSTNAME}/rest/v1.0/test_config`, {});

        const { body } = await client.get({ base: '/test_config' });
        expect(body).to.eql({});
        fetchMock.restore();
      })

      it('allows response headers override', async () => {
        const headers = new Headers();
        const authorizer = sdk.oauth(token);
        const client = sdk.client(authorizer, { headers }, {});
        const successResponse = { success: true };

        fetchMock.get(`${HOSTNAME}/rest/v1.0/test_config`, successResponse);

        const { body, response } = await client.get({ base: '/test_config' });
        expect(body).to.eql(successResponse);

        // Why does adding a headers object as a default remove the Authorization header?
        expect(response.headers.has('Authorization')).to.equal(false);

        fetchMock.restore();
      })

      it('returns the raw request even if the request fails', async () => {
        const client = sdk.client(sdk.oauth(token), {}, {});
        const response = {
          status: 401,
          body: { errors: { name: ['is already taken'] } }
        };

        fetchMock.get(`${HOSTNAME}/vapid/test_config`, response);

        await client.get({ base: '/test_config', version: 'vapid' })
          .catch(({ body, response: { status } }) => {
            expect(body).to.eql(response.body);
            expect(status).to.eql(response.status);

            fetchMock.restore();
          })
      })
    })

    describe('request using version', () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, {}, {});

      it('sets default version when not passing', async () => {
        fetchMock.get(`${HOSTNAME}/rest/v1.0/me`, me);

        const { body } = await client.get({ base: '/me', version: undefined });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('use default version when not passing', async () => {
        fetchMock.get(`${HOSTNAME}/rest/v1.0/me`, me);

        const { body } = await client.get({ base: '/me' });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('customize with specified version', async () => {
        fetchMock.get(`${HOSTNAME}/rest/v1.1/me`, me);

        const { body } = await client.get({ base: '/me', version: 'v1.1' });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('still work for vapid when explicitly passed', async () => {
        fetchMock.get(`${HOSTNAME}/vapid/me`, me);

        const { body } = await client.get({ base: '/me', version: 'vapid' });
        expect(body).to.eql(me);

        fetchMock.restore();
      })
    })

    describe('request using ClientOptions', () => {
      const authorizer = sdk.oauth(token)

      it('overrides apiHostname with passed default', async () => {
        const client = sdk.client(authorizer, undefined, { apiHostname: 'https://api.procore.com' });
        fetchMock.get(`https://api.procore.com/rest/v1.0/me`, me);

        const { body } = await client.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides version with passed default', async () => {
        const client = sdk.client(authorizer, undefined, { defaultVersion: 'vapid' });
        fetchMock.get(`${HOSTNAME}/vapid/me`, me);

        const { body } = await client.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides both apiHostname and version with passed defaults', async () => {
        const client = sdk.client(authorizer, undefined, { apiHostname: 'https://api.procore.com', defaultVersion: 'vapid' });
        fetchMock.get(`https://api.procore.com/vapid/me`, me);

        const { body } = await client.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides apiHostname with passed default and uses version passed in .get', async () => {
        const client = sdk.client(authorizer, undefined, { apiHostname: 'https://api.procore.com', defaultVersion: 'vapid' });
        fetchMock.get(`https://api.procore.com/rest/v1.1/me`, me);

        const { body } = await client.get({ base: '/me', version: 'v1.1' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });

      it('overrides apiHostname with passed default as string', async () => {
        const client = sdk.client(authorizer, undefined, 'https://api.procore.com');
        fetchMock.get(`https://api.procore.com/rest/v1.0/me`, me);

        const { body } = await client.get({ base: '/me' });
        expect(body).to.eql(me);
        fetchMock.restore();
      });
    })

    describe('#post', () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, {}, {});

      it('creates a resource', async () => {
        fetchMock.post(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis`, headers: headers }, rfi);

        const { body } = await client
          .post({
            base: '/projects/{project_id}/rfis',
            params: { project_id: 3 }
          }, rfi);
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('sends a valid body', async () => {
        fetchMock.post(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis`, headers: headers }, (url, opts: RequestInit) => {
            return opts.body;
          });

        const { body } = await client
          .post({
            base: '/projects/{project_id}/rfis',
            params: { project_id: 3 }
          }, rfi);
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })
    })

    describe('#get', () => {
      const authorizer = sdk.oauth(token);
      const client = sdk.client(authorizer, {}, {});

      it('gets a signleton resource', async () => {
        fetchMock.get({ url: `${HOSTNAME}/rest/v1.0/me`, headers: headers }, me);

        const { body } = await client.get({ base: '/me', params: {} });
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('using a string url as the endpoint gets a signleton resource', async () => {
        fetchMock.get({ url: `${HOSTNAME}/me`, headers: headers }, me);

        const { body } = await client.get('/me');
        expect(body).to.eql(me);

        fetchMock.restore();
      })

      it('gets the resource by id', async () => {
        fetchMock.get(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, rfi);

        const { body } = await client
          .get(
            { base: '/projects/{project_id}/rfis', params: { project_id: project.id, id: rfi.id } }
          );
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('gets the resource by id and project_id in querystring', async () => {
        const project_id = project.id;

        fetchMock.get(
          { url: `${HOSTNAME}/rest/v1.0/rfis/${rfi.id}?project_id=${project_id}&foo=1&bar=2`, headers: headers }, rfi);

        const qs = { foo: 1, bar: 2 };

        const { body } = await client
          .get(
            { base: '/rfis', params: { id: rfi.id }, qs: { project_id, ...qs } }
          );
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('gets the resource by query strings', async () => {
        fetchMock.get(
          { url: `${HOSTNAME}/rest/v1.0/projects?a%5B%5D=1&a%5B%5D=2`, headers: headers }, rfi);

        const { body } = await client
          .get(
            { base: '/projects', qs: { a: [1, 2] } }
          );
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('Total and Per-Page is in response header', async () => {
        fetchMock.get(
          { url: `${HOSTNAME}/rest/v1.0/pagination_test`, headers: headers }, { body: [], headers: { Total: 500, 'Per-Page': 10 } });

        const { body, response } = await client.get({ base: '/pagination_test', params: {} });
        expect(body).to.eql([]);
        expect(response.headers.get('Total')).to.equal('500');
        expect(response.headers.get('Per-Page')).to.equal('10');

        fetchMock.restore();
      })

      it('gets the resources with action', async () => {
        fetchMock.get(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis/recycle_bin`, headers: headers }, [rfi]);

        const { body } = await client
          .get(
            { base: '/projects/{project_id}/rfis', params: { project_id: project.id }, action: 'recycle_bin' }
          );
        expect(body).to.eql([rfi]);

        fetchMock.restore();
      })
    })

    describe('#delete', () => {
      const authorizer = sdk.oauth(token)

      const client = sdk.client(authorizer, {}, {})

      it('deletes a resource without a body', async () => {
        fetchMock.delete(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, rfi);

        const { body } = await client
          .delete({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          });
        expect(body).to.eql(rfi);

        fetchMock.restore();
      })

      it('deletes resource(s) sent with a body', async () => {
        fetchMock.delete(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, (url, opts: RequestInit) => {
            return { body: opts.body, status: 200 };
          });

        const { body } = await client
          .delete({
            base: '/projects/{project_id}/rfis/{rfi_id}',
            params: { project_id: 3, rfi_id: rfi.id }
          }, idsToDelete);
        expect(body).to.eql(idsToDelete);

        fetchMock.restore();
      })

      it('handles delete with no response: status 204', async () => {
        fetchMock.delete(
          { url: `${HOSTNAME}/rest/v1.0/projects/${project.id}/rfis/${rfi.id}`, headers: headers }, { status: 204 });

        const { body } = await client
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
