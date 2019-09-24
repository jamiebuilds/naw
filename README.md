# `naw`

> Your very own containerized build system!

- Want your build tools to run the exact same way locally as they do in CI?
- Want to have a test suite for your build tools themselves?
- Want to reduce the number of build tool dependencies that need to be installed locally?
- Well `naw` is here to help!

## Install

```sh
npm i -g naw
```

## CLI

```txt
Usage
  $ naw
  $ naw --init                    Create a new naw project.
  $ naw <task>                    Run <task>
  $ naw <task> --build/-b         Build <task>
  $ naw <task> --test/-t          Test <task>
  $ naw <task> --debug/-d         Debug <task>
  $ naw <task> --debug --test     Debug <task> tests
  $ naw <task> --build --debug    Build+Debug <task>
```
