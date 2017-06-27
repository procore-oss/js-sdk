"use strict";
require("isomorphic-fetch");
var Refresher = (function () {
    function Refresher(oauth, refresh) {
        var _this = this;
        this.authorize = function (request) {
            var self = _this;
            return self.oauth.authorize(request)
                .catch(function () { return self.refresh(self.oauth.getToken())
                .then(function (_a) {
                var auth_token = _a.auth_token;
                self.oauth.setToken(auth_token);
                return self.oauth.authorize(request);
            }); });
        };
        this.oauth = oauth;
        this.refresh = refresh;
    }
    return Refresher;
}());
function refresher(oauth, refreshToken) {
    return new Refresher(oauth, refreshToken);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = refresher;
