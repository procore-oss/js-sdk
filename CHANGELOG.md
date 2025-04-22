# Change Log

## 4.3.0 (April 16 2025)

* Add support for unversioned API requests with `version: 'unversioned'` option

## 4.2.1 (March 8 2024)

* Update package urls to point to new repo
* Use new GitHub Action to handle release tagging

## 4.2.0 (March 7 2024)

* Move repo to <https://github.com/procore-oss/js-sdk>
* Update package.json dependencies to latest versions
  * via dependabot PRs
  * Explicitly mention we support node 14, 16, 17, 18, 19, 20, 21 but
    emphasize latest LTS version
* Setup repository standards (CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md)
* Move tests to GitHub Actions
* Update badges in README.md
* Add check for all PR commits to be signed to meet our [DCO](https://github.com/apps/dco/) requirement

## 4.1.0 (November 2023)

* Update codes to be consistent of API hostname `api.procore.com`

## 4.0.2 (March 2023)

* Improve Csrf Class (No change in functionality)
* Update package.json dependencies

## 4.0.1 (March 2023)

* Readme Improvement

## 4.0.0 (March 2023)

* Fix Csrf Class
* Require Node >= 14.15.0 (First LTS version of this version)
* Update package.json dependencies

### Upgrading

Upgrade to NodeJs 14.15.0 or higher.

## 3.0.2 (September 2022)

* Add support for adding `Procore-Company-Id` request header when `defaultCompanyId` is passed in `ClientOptions`.
* Add support for adding `Procore-Company-Id` request header when `companyId` is passed in `RequestConfig`.
* Add support for customer headers.

## 3.0.1 (June 2021)

* Adds support for Rest API versioning (rest/v1.0 is)
* Remove `ramda` dependency
* Remove `string` dependency
* Remove `@procore/js-sdk-endpoints` dependency
* Add support for revoking token `revoke()`
* Add `Procore-Sdk-Version` header to all requests
* Add `Procore-Sdk-Language` header to all requests
* Updated `destroy` method to `delete` method

### Breaking Changes

* Remove `/vapid` from base attribute passed to `client.<method>` functions. Versioning will be handled in the `client.<method>` function. See the [Upgrading](#upgrading) section for details about how to upgrade to version 3.0.1.
* `destroy` method is no longer supported. Convert all `destroy` requests to `delete`.

### Upgrading

As of v3.0.1, this npm package now defaults to making requests against Procore's new
`/rest/v1.0` namespace, instead of the now deprecated `/vapid` namespace.

Previous Version Usage

```javascript
// In Previous Version
const procore = client(authorizer);
const { body } = await procore.get({
  base: '/vapid/drawing_areas/{drawing_area_id}/drawings',
  params: { drawing_area_id: 42 }
});
// app.procore.com/vapid/drawing_areas/42/drawings
```

v3.0.1 Version Usage

```javascript
const procore = client(authorizer);

// Default version is v1.0
const { body } = await procore.get({
  base: '/drawing_areas/{drawing_area_id}/drawings',
  params: { drawing_area_id: 42 }
});
// app.procore.com/rest/v1.0/drawing_areas/42/drawings

// Override default version
const { body } = await procore.get({
  base: '/drawing_areas/{drawing_area_id}/drawings',
  params: { drawing_area_id: 42 },
  version: 'v1.1' });
// app.procore.com/rest/v1.1/drawing_areas/42/drawings

// Override default version with legacy version
const { body } = await procore.get({
  base: '/drawing_areas/{drawing_area_id}/drawings',
  params: { drawing_area_id: 42 },
  version: 'vapid' });
// app.procore.com/vapid/drawing_areas/42/drawings
```

To keep the legacy behavior, set the new `defaultVersion` configuration option when
creating the `client`.

```javascript
const procore = client(authorizer, undefined, { defaultVersion: 'vapid' });
```

Note, that Rest v1.0 is a superset of the Vapid Api - there are no breaking
changes.

[Read more here](https://developers.procore.com/documentation/vapid-deprecation)

All the request methods (`get`, `post`, `put`, `patch`, `delete`) now
accept an optional `version` attribute to specify the version at request time.

`destroy` method is no longer supported. Convert all `destroy` requests to `delete`.

## 2.4.1
- deps: `"@procore/js-sdk-endpoints": "1.9.2"` adds types from fixing bad URL generation
