"use strict";
require("isomorphic-fetch");
var hostname_1 = require("./hostname");
function implicit(_a) {
    var id = _a.id, uri = _a.uri;
    return hostname_1.default + "/oauth/authorize?response_type=token&client_id=" + id + "&redirect_uri=" + uri;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = implicit;
