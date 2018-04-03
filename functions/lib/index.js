"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase-functions");
const node_fetch_1 = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();
exports.handlePullRequest = firebase.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    let { action, pull_request } = JSON.parse(req.body.payload);
    if (action !== "opened") {
        res.send("Not creating a pull request");
        return;
    }
    let github_api_key = firebase.config().app.github_api_key;
    let headers = { Authorization: `Bearer ${github_api_key}` };
    let issueBody = `
    query { 
      viewer { 
        organization(login: "Atlantic57") {
          repository(name: "a57-hugo") {
            issues(labels: ["QA"], first: 50) {
              nodes {
                title
                number
              }
            }
          }
        }
      }
    }`;
    let issuesRes = yield node_fetch_1.default("https://api.github.com/graphql", {
        headers,
        issueBody
    });
    let issues = issuesRes.json();
    let pullRequestBody = issues.data.viewer.organization.repository.issues.nodes
        .map(({ title, number }) => {
        return `${title} [#${number}]`;
    })
        .join("\n");
    let updateRes = yield node_fetch_1.default(`https://api.github.com/repos/${pull_request.repository.full_name}/pulls/${pull_request.number}`, {
        method: "PATCH",
        headers,
        body: pullRequestBody
    });
    if (updateRes.ok) {
        res.send("Success!");
        return;
    }
    res.send("An error occurred");
}));
//# sourceMappingURL=index.js.map