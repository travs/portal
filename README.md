<img src = "https://github.com/melonproject/branding/blob/master/facebook/Facebook%20cover%20blue%20on%20white.png" width = "100%">

# portal

Application of the melon protocol portal. 

[![Slack Status](http://chat.melonport.com/badge.svg)](http://chat.melonport.com) [![Gitter](https://badges.gitter.im/melonproject/general.svg)](https://gitter.im/melonproject/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Installation

1. Clone this repository
    ```
    git clone git@github.com:melonproject/portal.git
    cd portal

    ```

2. Install dependencies:
    ```
    meteor npm install
    ```

## Getting started

After installation is complete

Go to the above `portal` directory, open a terminal and launch meteor:

```
npm start
```

## [chimp testing](https://chimp.readme.io/)

To run the chimp tests, you need to have a Meteor & 
[testrpc](https://github.com/ethereumjs/testrpc) instances running. To do this,
open 3 terminal windows and run the following commands in each window:

- ```npm start```
- ```npm run testrpc```
- ```npm run test:chimp:watch``` to only run tests annotated with '@watch' or
    ```npm run test:chimp:once``` to run all chimp tests (can take some time)
    just once.

If you have your own Ethereum client running locally on http://localhost:8545, 
I strongly suggest that you pause it as long as the tests run.


## Unit Testing

We use [Facebook's Jest](https://facebook.github.io/jest/) for Unit Testing. Run all Jest-Tests with:

    npm run jest

(You do not have to install Jest globally on your machine).

During development, I recommend watching the changed files in the background
and test them when changed automatically with

    npm run jest:watch

### Troubleshooting

If you have troubles running the watch command with the following error:

    Error: Error watching file for changes: EMFILE

Try install [Watchman](https://facebook.github.io/watchman/docs/install.html) with:

    brew install watchman

(Thanks to [Colin Witkamp](https://stackoverflow.com/questions/41657754/testing-with-jest-failed-with-error-error-watching-file-for-changes-emfile) / [robzolkos](https://github.com/facebook/jest/issues/1767#issuecomment-248883102))


## Deploy

Deployment is made with the awesome [zodern/meteor-up](https://github.com/zodern/meteor-up)

If meteor-up is configured, deploy with
```npm run deploy```
