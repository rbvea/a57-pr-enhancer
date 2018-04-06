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
const request = require("request-promise-native");
exports.handlePullRequest = firebase.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    let { action, pull_request, repository } = JSON.parse(req.body.payload);
    if (action !== "opened") {
        res.send("Not creating a pull request");
        return;
    }
    let github_api_key = firebase.config().app.github_api_key;
    let headers = {
        Authorization: `Bearer ${github_api_key}`,
        "User-Agent": "rbvea"
    };
    let query = `query {
       viewer { 
        organization(login: \"Atlantic57\") {
          repository(name: \"${repository.name}\") {
            issues(labels: [\"QA\"], first: 50) {
              nodes {
                title
                number
              }
            }
          }
        }
      }
    }`;
    query = query.replace(/\n/g, "");
    try {
        let issuesRes = yield request.post({
            url: "https://api.github.com/graphql",
            json: true,
            headers,
            body: {
                query
            }
        });
        let { issues } = issuesRes.data.viewer.organization.repository;
        let pullRequestBody = issues.nodes
            .map(({ title, number }) => {
            return `* ${title} [#${number}]`;
        })
            .join("\n");
        let messageBody = [
            pull_request.body,
            "### Issues addressed",
            pullRequestBody
        ].join("\n");
        let uri = `https://api.github.com/repos/${repository.full_name}/pulls/${pull_request.number}`;
        let updateRes = yield request.post({
            uri,
            method: "PATCH",
            headers,
            json: true,
            body: {
                body: messageBody
            }
        });
        if (updateRes.body) {
            res.send("Success!");
            return;
        }
        res.send("An error occurred");
    }
    catch (e) {
        res.json(e);
    }
}));
//# sourceMappingURL=index.js.map