"use strict";
require("isomorphic-fetch");
var hostname_1 = require("./hostname");
function token(_a) {
    var id = _a.id, secret = _a.secret, code = _a.code, uri = _a.uri;
    return fetch(hostname_1.default + "/oauth/token?grant_type=authorization_code&code=" + code + "&client_id=" + id + "&client_secret=" + secret + "&redirect_uri=" + uri, { method: 'POST' })
        .then(function (res) { return res.json(); });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = token;
