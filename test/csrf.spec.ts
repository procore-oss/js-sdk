import { JSDOM } from 'jsdom'
import { spy } from 'sinon'
import { csrf } from '../lib/index'
import { expect } from 'chai'

interface Global {
  document?: Document;
  window?: Window;
}

declare const global: Global;

describe('csrf', () => {

  const CSRF_TOKEN = 'TbG95RTOHyFZ1356swct6HX1CqeLMSRLAxsBSydJDKAR1q/LtW6fJziqvbyq0iyVhujaaadj09OjvcuYgDWeTg==';

  describe('#authorize', () => {

    it('provides csrf token header with custom getToken function for the request', async () => {
      const getToken = () => 'fake_token';
      const authorizer = csrf(undefined, getToken);
      const request = spy();

      await authorizer.authorize(request);

      const [csrfHeader, token] = request.getCall(0).args[0];
      expect(csrfHeader).to.eql('X-CSRF-TOKEN');
      expect(token).to.eql('fake_token');
    });

    it('provides csrf token header with custom csrf header name and getToken function for the request', async () => {
      const getToken = () => 'fake_token';
      const authorizer = csrf('anti-csrf-token', getToken);
      const request = spy();

      await authorizer.authorize(request);

      const [csrfHeader, token] = request.getCall(0).args[0];
      expect(csrfHeader).to.eql('anti-csrf-token');
      expect(token).to.eql('fake_token');
    });

    it('provides csrf token header with csrf-token in meta tag', async () => {
      const { window } = new JSDOM(
        `<!doctype html><html><head><meta name="csrf-token" content="${CSRF_TOKEN}"></head></html>`,
        {
          url: "https://app.procore.com"
        }
      );
      global.document = window._document;
      global.window = window;

      const authorizer = csrf();
      const request = spy();

      await authorizer.authorize(request);

      const [csrfHeader, token] = request.getCall(0).args[0];
      expect(csrfHeader).to.eql('X-CSRF-TOKEN');
      expect(token).to.eql(CSRF_TOKEN);

      // Clean up
      delete global.document;
      delete global.window;
    });

    it('provides csrf token header with csrf-token in cookie', async () => {
      const { window } = new JSDOM(
        '<!doctype html><html></html>',
        {
          url: "https://app.procore.com",
          cookieJar: { getCookieStringSync: () => `csrf_token=${encodeURIComponent(CSRF_TOKEN)}; domain=.procore.com; path=/; secure; SameSite=Strict` }
        }
      );
      global.document = window._document;
      global.window = window;
      const authorizer = csrf();
      const request = spy();

      await authorizer.authorize(request);

      const [csrfHeader, token] = request.getCall(0).args[0];
      expect(csrfHeader).to.eql('X-CSRF-TOKEN');
      expect(token).to.eql(CSRF_TOKEN);

      // Clean up
      delete global.document;
      delete global.window;
    });

  });
})
