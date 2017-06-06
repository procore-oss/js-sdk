"use strict";
require("isomorphic-fetch");
var hostname_1 = require("./hostname");
function refresh(_a) {
    var id = _a.id, secret = _a.secret, uri = _a.uri, token = _a.token, refresh = _a.refresh;
    return fetch(hostname_1.default + "/oauth/token?grant_type=refresh_token&$client_id=" + id + "&client_secret=" + secret + "&redirect_uri=" + uri + "&refresh_token=" + refresh, { method: 'POST', headers: { 'Authorization': "Bearer " + token } })
        .then(function (res) { return res.json(); });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = refresh;
