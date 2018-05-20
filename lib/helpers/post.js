"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("whatwg-fetch");
var post = function (url, body) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
};
exports.default = post;
//# sourceMappingURL=post.js.map