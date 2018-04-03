import * as firebase from "firebase-functions";
import fetch, { Headers } from "node-fetch";

import * as dotenv from "dotenv";
dotenv.config();

export const handlePullRequest = firebase.https.onRequest(async (req, res) => {
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
          repository(name: ${pull_request.repository.name}) {
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
  let issuesRes = await fetch("https://api.github.com/graphql", {
    headers,
    issueBody
  });
  let parsedIssues = issuesRes.json();
  let { issues } = parsedIssues.data.viewer.organization.repository.
  let pullRequestBody = issues.data.viewer.organization.repository.issues.nodes
    .map(({ title, number }) => {
      return `${title} [#${number}]`;
    })
    .join("\n");
  let updateRes = await fetch(
    `https://api.github.com/repos/${pull_request.repository.full_name}/pulls/${
      pull_request.number
    }`,
    {
      method: "PATCH",
      headers,
      body: { body: pullRequestBody }
    }
  );
  if (updateRes.ok) {
    res.send("Success!");
    return;
  }
  res.send("An error occurred");
});
