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
meteor
```

## Running [chimp tests](https://chimp.readme.io/)

To run the chimp tests, you need to have a Meteor & 
[testrpc](https://github.com/ethereumjs/testrpc) instances running. To do this,
open 3 terminal windows and run the following commands in each window:

- ```meteor```
- ```npm run testrpc```
- ```npm run test:chimp:watch``` to only run tests annotated with '@watch' or
    ```npm run test:chimp:once``` to run all chimp tests (can take some time)
    just once.

If you have your own Ethereum client running locally on http://localhost:8545, 
I strongly suggest that you pause it as long as the tests run.

### TODO:
See [#43](https://github.com/melonproject/portal/issues/43)
- [ ] One command to run meteor, testrpc and the full chimp tests
- [ ] Run that command on the CI server
