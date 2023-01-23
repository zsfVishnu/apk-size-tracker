# Apk-size-tracker

The size of an app is one of the most crucial metrics that affects its adoption.
The installation rate of an app is mostly inversely proportional to its size.
However, there is no easy way to continuously track the increase in app size
with every piece of code you commit. This action solved the problem of faster
feedback on the app size at the most meaningful point - when a pull request is
raised to the master branch. For every pull request raised, the apk size of that
branch and the apk size of master branch is compared and a report is generated.
The report provides the difference in apk size, as well as some other metrics
to help you track any increase in app size.

## apk-metric-upload

For us to compare the feature branch size with the latest master, we continuously
monitor master branch merges as well. The [apk-metric-upload](https://github.com/zsfVishnu/apk-metric-upload)
action takes care of
this easily. Please add this action to your workflow and merge to master before
using the size tracker action.

## Usage

The action can be used to track both native and react native app sizes. Given below are
examples of how to use the app for the two platforms.

### Native App

To integrate it with the native app, you only need to provide the name of the
debug flavor you want to track and the GITHUB_TOKEN. For now the plugin only
tracks builds of debug variants since it doesn't need any release keys. We'll be
adding support for release build tracking in the upcoming releases.

At the start of each workflow run, GitHub automatically creates a unique
GITHUB_TOKEN secret to use in your workflow. You can use the GITHUB_TOKEN to
authenticate in a workflow run. This token can be passed as shown below.

```yaml
jobs:
  ApkSizeTracker:
    runs-on: ubuntu-latest
    name: Apk size tracker
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          
      - name: Calculate delta
        id: apk-size-tracker
        uses: zsfVishnu/apk-size-tracker@v1.0.0
        with:
          flavor: 'debug'
          GITHUB_TOKEN: {{ secrets.GITHUB_TOKEN }}
          threshold: 0
```

### React Native App

To use the action in your react native project you need to provide the flavor and
GITHUB_TOKEN mentioned in the case of native example, plus a boolean parameter
`is-react-native` to indicate that it's a react native project to the action.

```yaml
jobs:
  ApkSizeTracker:
    runs-on: ubuntu-latest
    name: Apk size tracker
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          
      - name: Install dependencies
        run: yarn install
          
      - name: Calculate delta
        id: apk-size-tracker
        uses: zsfVishnu/apk-size-tracker@v1.0.0
        with:
          flavor: 'debug'
          GITHUB_TOKEN: {{ secrets.GITHUB_TOKEN }}
          is-react-native: true
          threshold: 3
```

## Parameters

### `threshold`

Apart from the essential parameters needed to run native and react projects, you
can add a `threshold` parameter. The threshold creates a kind of upper limit of
size increase that is allowed on the feature branch. If the limit is crossed, it
fails the workflow run with the respective message that the threshold has been
exceeded. You can specify the threshold in MB.

For example, to set a 3 MB threshold you can do this

```yaml
- name: Calculate delta
  id: apk-size-tracker
  uses: zsfVishnu/apk-size-tracker@v1.0.0
  with:
  flavor: 'debug'
  GITHUB_TOKEN: {{ secrets.GITHUB_TOKEN }}
  is-react-native: true
  threshold: 3
```

## Sample Reports

![Screenshot 2023-01-24 at 12.01.11 AM.png](..%2F..%2FScreenshot%202023-01-24%20at%2012.01.11%20AM.png)

<img width="982" alt="Screenshot 2022-12-03 at 11 31 58 PM" src="https://user-images.githubusercontent.com/34836841/205455211-898ef34c-9c1b-4a12-a990-b365f392ee13.png">
