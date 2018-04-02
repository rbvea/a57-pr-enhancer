"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase-functions");
exports.handlePullRequest = firebase.https.onRequest((req, res) => {
    res.send("Hello, World!");
});
//# sourceMappingURL=index.js.map