"use strict";
require("isomorphic-fetch");
var qs_1 = require("qs");
var S = require("string");
var when = require("ramda/src/when");
var not = require("ramda/src/not");
var isNil = require("ramda/src/isNil");
var compose = require("ramda/src/compose");
var hostname_1 = require("./hostname");
var notNil = compose(not, isNil);
function authValid(response) {
    if (response.status === 403) {
        throw new Error(response.status + " " + response.statusText);
    }
    else {
        return response;
    }
}
function request(url, payload, method) {
    var headers = new Headers();
    headers.append('Accept', 'application/json');
    return function authorizedRequest(_a) {
        var authKey = _a[0], authValue = _a[1];
        headers.append(authKey, authValue);
        var request = fetch(url, { mode: 'cors', credentials: 'include', method: method, headers: headers });
        return request
            .then(authValid)
            .then(function (response) { return new Promise(function (res, rej) {
            return response
                .json()
                .then(function (body) {
                res({ body: body, request: request, response: response });
            })
                .catch(rej);
        }); });
    };
}
var Client = (function () {
    function Client(authorizer, host) {
        if (host === void 0) { host = hostname_1.default; }
        var _this = this;
        this.get = function (endpoint) {
            return _this.authorize(request(_this.url(endpoint), null, 'GET'));
        };
        this.post = function (endpoint, payload) {
            return _this.authorize(request(_this.url(endpoint), payload, 'POST'));
        };
        this.patch = function (endpoint, payload) {
            return _this.authorize(request(_this.url(endpoint), payload, 'PATCH'));
        };
        this.destroy = function (endpoint) {
            return _this.authorize(request(_this.url(endpoint), null, 'DESTROY'));
        };
        this.url = function (_a) {
            var base = _a.base, action = _a.action, params = _a.params, qs = _a.qs;
            return compose(when(function () { return notNil(qs); }, function (finalUrl) { return finalUrl + "?" + qs_1.stringify(qs); }), when(function () { return notNil(action); }, function (resourceUrl) { return resourceUrl + "/" + action; }), when(function () { return notNil(params.id); }, function (collectionUrl) { return collectionUrl + "/" + params.id; }), function (hostname) { return "" + hostname + S(base).template(params, '{', '}').s; })(_this.host);
        };
        this.authorize = authorizer.authorize;
        this.host = host;
    }
    return Client;
}());
exports.Client = Client;
function client(authorizer, host) {
    if (host === void 0) { host = hostname_1.default; }
    return new Client(authorizer, host);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = client;
