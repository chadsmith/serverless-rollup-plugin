Serverless Rollup Plugin
=============================

Forked from [serverless-optimizer-plugin](https://github.com/serverless/serverless-optimizer-plugin) this plugin uses
[Rollup](http://rollupjs.org/) to optimize your Serverless Node.js Functions on deployment.

Reducing the file size of your AWS Lambda Functions allows AWS to provision them more quickly, speeding up the response
time of your Lambdas.  Smaller Lambda sizes also helps you develop faster because you can upload them faster.  
This Severless Plugin is absolutely recommended for every project including Lambdas with Node.js.

**Note:** Requires Serverless *v0.5.0*.

### Setup

* Install the plugin and rollup in the root of your Serverless Project:
```
npm install serverless-rollup-plugin rollup --save-dev
```

* Add the plugin to the `plugins` array in your Serverless Project's `s-project.json`, like this:

```
plugins: [
    "serverless-rollup-plugin"
]
```

* In the `custom` property of your `s-project.json`  add a rollup property.

```javascript
{
  "custom": {
    "rollup": {
      "config": "path/relative/to/project-path"
    }
  }
}

```

** You can optimize all your Node.js functions by configuring your `s-project.json`:

```javascript
{
  "custom": {
    "rollup": {
      "config": "path/relative/to/project-path",
      "global": true
    }
  }
}
```

** Or only optimize certain functions by configuring their `s-function.json`:

```javascript
{
  "custom": {
    "rollup": true
  }
}
```

## Rollup config
You can completely customize how your code is transformed and optimized by specifying your own rollup config. Heres a sample `rollup.config.js`:

**Note:** Remember to install any rollup plugins you plan to use.

```javascript
var rollup = require('rollup');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var inject = require('rollup-plugin-inject');
var babel = require('rollup-plugin-babel');
var uglify = require('rollup-plugin-uglify');

module.exports = {
  // entry: provided by serverless
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      extensions: [ '.js', '.jsx' ],
      preferBuiltins: true
    }),
    commonjs(),
    inject({
      Promise: 'es6-promise'
    }),
    babel(),
    uglify()
  ]
};
```
