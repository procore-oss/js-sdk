"use strict";
var hostname_1 = require("./hostname");
function authorize(_a) {
    var clientId = _a.clientId, uri = _a.uri;
    return hostname_1.default + "/oauth/authorize?client_id=" + clientId + "&response_type=code&redirect_uri=" + uri;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authorize;
