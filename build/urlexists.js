"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlExistNodeJS = void 0;
//Fork from https://github.com/nwaughachukwuma/url-exists-nodejs#readme
const http_1 = __importDefault(require("http"));
async function urlExistNodeJS(url) {
    if (typeof url !== "string") {
        throw new TypeError(`Expected a string, got ${typeof url}`);
    }
    const valid_url = validURL(url);
    if (!valid_url)
        return false;
    const { host, pathname } = valid_url;
    const opt = {
        method: "HEAD",
        host: host,
        path: pathname,
    };
    return await new Promise((resolve) => {
        const req = http_1.default.request(opt, (r) => resolve(/4\d\d/.test(`${r.statusCode}`) === false));
        req.on("error", () => resolve(false));
        req.end();
    });
}
exports.urlExistNodeJS = urlExistNodeJS;
// inspired by https://github.com/sindresorhus/is-url-superb/blob/main/index.js
function validURL(url) {
    try {
        return new URL(url.trim()); // eslint-disable-line no-new
    }
    catch (_e) {
        return null;
    }
}
exports.default = urlExistNodeJS;
