"use strict";
function header(token) {
    return ['Authorization', "Bearer " + token];
}
var OauthAuthorizer = (function () {
    function OauthAuthorizer(token) {
        var _this = this;
        this.authorize = function (request) { return request(header(_this.token)); };
        this.setToken = function (token) {
            _this.token = token;
        };
        this.getToken = function () { return _this.token; };
        this.token = token;
    }
    return OauthAuthorizer;
}());
exports.OauthAuthorizer = OauthAuthorizer;
function oauth(token) {
    return new OauthAuthorizer(token);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = oauth;
