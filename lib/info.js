"use strict";
require("isomorphic-fetch");
var hostname_1 = require("./hostname");
function info(token) {
    return fetch(hostname_1.default + "/oauth/token/info", { method: 'POST', headers: { 'Authorization': "Bearer " + token } })
        .then(function (res) { return res.json(); });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = info;
