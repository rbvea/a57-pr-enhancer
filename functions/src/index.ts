import * as firebase from "firebase-functions";
import fetch, { Headers } from "node-fetch";
import * as request from "request-promise-native";

export const handlePullRequest = firebase.https.onRequest(async (req, res) => {
  let { action, pull_request, repository } = JSON.parse(req.body.payload);
  if (action !== "opened") {
    res.send("Not creating a pull request");
    return;
  }
  let github_api_key: string = firebase.config().app.github_api_key;

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
    let issuesRes = await request.post({
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

    let uri = `https://api.github.com/repos/${repository.full_name}/pulls/${
      pull_request.number
    }`;

    let updateRes = await request.post({
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
  } catch (e) {
    res.json(e);
  }
});
