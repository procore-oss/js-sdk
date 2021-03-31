# Change Log

## 3.0.0 (March 31, 2021)

* Adds support for Rest API versioning (rest/v1.0 is default)
* Remove `ramda` dependency
* Remove `string` dependency
* Remove `@procore/js-sdk-endpoints` dependency
* Add support for revoking token `revoke()`

### Upgrading

As of v3.0.0, this npm package now defaults to making requests against Procore's new
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

v3.0.0 Version Usage

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
