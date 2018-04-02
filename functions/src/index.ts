import * as firebase from "firebase-functions";

export const handlePullRequest = firebase.https.onRequest((req, res) => {
  res.send("Hello, World!");
});
