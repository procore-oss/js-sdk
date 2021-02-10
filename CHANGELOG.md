# Change Log

## 3.0.0 (February 15, 2021)

* Adds support for API versioning
* Remove `ramda` dependency
* Remove `string` dependency
* Remove `@procore/js-sdk-endpoints` dependency

### Upgrading

As of v3.0.0, this npm package now defaults to making requests against Procore's new
`/rest/v1.0` namespace, instead of the now deprecated `/vapid` namespace.

Previous Version Usage

```javascript
// In Previous Version
const { body } = await procore.get({ base: '/vapid/me' });
// app.procore.com/vapid/me
```

v3.0.0 Version Usage

```javascript
// Default version is v1.0
const { body } = await procore.get({ base: '/me' });
// app.procore.com/rest/v1.0/me

// Override default version
const { body } = await procore.get({ base: '/me', version: "v1.1" });
// app.procore.com/rest/v1.1/me

// Override default version with legacy version
const { body } = await procore.get({ base: '/me', version: "vapid" });
// app.procore.com/vapid/me
```

To keep the legacy behavior, set the new `defaultVersion` configuration option.
Note, that Rest v1.0 is a superset of the Vapid Api - there are no breaking
changes.

[Read more here](https://developers.procore.com/documentation/vapid-deprecation)

```javascript
TODO: Add example for defaultVersion
```

All the request methods (`get`, `post`, `put`, `patch`, `destroy|delete`) now
accept an optional `version` attribute to specify the version at request time.

```javascript
const { body } = await procore.get({ base: '/me' });
// https://app.procore.com/rest/v1.0/me

const { body } = await procore.get({ base: '/me', version: "v1.1" });
// https://app.procore.com/rest/v1.1/me

const { body } = await procore.get({ base: '/me', version: "vapid" });
// https://app.procore.com/vapid/me
```

## 2.4.1
- deps: `"@procore/js-sdk-endpoints": "1.9.2"` adds types from fixing bad URL generation
