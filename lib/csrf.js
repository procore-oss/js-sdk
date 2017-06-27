"use strict";
var Csrf = (function () {
    function Csrf() {
    }
    Csrf.prototype.authorize = function (request) {
        return request(['X-CSRF-TOKEN', window.document.head.querySelector("[name=csrf-token]").getAttribute('content')]);
    };
    return Csrf;
}());
function csrf() {
    return new Csrf();
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = csrf;
