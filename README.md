# a57-pr-enhancer

This is a little TypeScript app that 
* listens on the [Pull Request](https://developer.github.com/v3/activity/events/types/#pullrequestevent) webhook
* gathers all the issues labeled "QA"
* appends them to the PR body in a little neat summary

## Deployment

This is desgned to work with [Firebase Cloud Functions](https://firebase.google.com/docs/functions/).  To deploy:

* Install firebase `npm i -g firebase-tools` and login with `firebase login`
* Create a firebase project and use that project with `firebase use [project]`
* Clone repo
* cd into `/path/to/repo/functions` and run `npm i`
* cd back to the repo root and run `firebase deploy --only functions`

It should respond with a successful deployment and your cloud function should be ready to use!
