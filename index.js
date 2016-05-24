'use strict';

module.exports = function(S) {

  const path    = require('path'),
    Rollup      = require('rollup'),
    wrench      = require('wrench'),
    BbPromise   = require('bluebird');

  class ServerlessRollup extends S.classes.Plugin {

    constructor() {
      super();
    }

    static getName() {
      return 'com.serverless.' + ServerlessRollup.name;
    }

    registerHooks() {
      S.addHook(this._optimize.bind(this), {
        action: 'codeDeployLambda',
        event: 'pre'
      });
      return BbPromise.resolve();
    }

    _optimize(evt) {
      // Validate: Check Serverless version
      // TODO: Use a full x.x.x version string. Consider using semver: https://github.com/npm/node-semver
      if(parseInt(S._version.split('.')[1]) < 5)
        console.log('WARNING: This version of the Serverless Rollup Plugin will not work with a version of Serverless that is less than v0.5');

      let project = S.getProject();
      let func    = S.getProject().getFunction(evt.options.name);

      let projectConf = project.custom && project.custom.rollup;
      let funcConf = func.custom && func.custom.rollup;

      if(/^nodejs/.test(func.getRuntime().getName()) && projectConf && (funcConf || (projectConf.global && funcConf !== false))) {
        let optimizer = new RollupNodejs(S, evt, func);
        return optimizer.optimize();
      }

      return BbPromise.resolve(evt);
    }

  }

  class RollupNodejs {

    constructor(S, evt, func) {
      this.evt = evt;
      this.function = func;
    }

    optimize() {
      let _this = this;
      return _this.rollup()
        .then(function() {
          return _this.evt;
        });
    }

    rollup() {
      let _this = this;
      const rollupConfig = require(path.join(S.config.projectPath, S.getProject().custom.rollup.config));
      const handlerFileName = _this.function.getHandler().split('.')[0] + '.js';
      const optimizedDistPath = path.join(_this.evt.options.pathDist, 'optimized');

      wrench.mkdirSyncRecursive(optimizedDistPath, '0777');

      rollupConfig.entry = path.join(_this.evt.options.pathDist, handlerFileName);

      return Rollup.rollup(rollupConfig)
        .then(function(bundle) {
          return bundle.write({
            format: 'cjs',
            dest: path.join(optimizedDistPath, handlerFileName)
          });
        })
        .then(function() {
          _this.evt.options.pathDist = optimizedDistPath;
        });
    }

  }

  return ServerlessRollup;
};
