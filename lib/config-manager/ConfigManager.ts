///<reference path="../../typings/vendor.d.ts" />
import wire = require('wire');
import when = require('when');
import _ = require('lodash');
import ResourceConfig = require('../resource/config/ResourceConfigInterface');
import ResourceCollectionConfig = require('../resource/config/ResourceCollectionConfigInterface');
import Resource = require('../resource/ResourceInterface');
import RunnerContext = require('context/RunnerContextInterface');
import tmplPlugin = require('./plugin/tmpl');

class ConfigManager {
  protected resourceMap = {};
  protected plugins = [];
  protected context:RunnerContext;

  public setResourceMap(serviceMap) {
    this.resourceMap = serviceMap;
    this.plugins = [
      tmplPlugin
    ];
  }

  public wireResource(resourceConfig:ResourceConfig):When.Promise<Resource> {
    // Convert the resource config into a Wire.js `create` factory.
    // We assign it a unique key, so we can pluck it out later.
    var RESOURCE_KEY = _.uniqueId('RESOURCE_');
    var spec = <any>{};
    spec[RESOURCE_KEY] = this.toFactorySpec(resourceConfig);


    return this.wire<Wire.Factories.create, any>(spec).
      // pluck out just the resource object
      // and add it to the parent context
      then((context) => {
        var resource = context[RESOURCE_KEY];
        return this.addResource(resourceConfig.name, resource);
      });
  }

  public wireParams(params:any):When.Promise<any> {
    return this.wire<any,any>(params).
      then((paramsCtx) => {
        return this.getContext().
          then((context) => context.params = paramsCtx)
      });
  }

  public addResource(name:string, resource:Resource):When.Promise<Resource> {
    return this.getContext().
      then((context) => {
        return context.resources[name] = resource
      });
  }

  public addPlugin(plugin:any) {
    this.plugins.push(plugin);
  }

  protected wire<TSpec, TContext>(spec:TSpec):When.Promise<TContext> {
    // Add plugins to spec
    spec['$plugins'] = _.clone(this.plugins);

    return this.getContext().
      then((context) => {
        return context.wire<TSpec, TContext>(spec);
      });
  }

  public getContext():When.Promise<RunnerContext> {
    // Return the context, or wire up a new one.
    return this.context ?
      when(this.context) :
      this.createContext().
        then((context) => this.context = context);
  }

  protected createContext():When.Promise<RunnerContext> {
    var spec:ResourceCollectionConfig = {
      params: {},
      resources: []
    };
    return wire<ResourceCollectionConfig, RunnerContext>(spec);
  }

  protected toFactorySpec(resourceConfig:ResourceConfig):Wire.Factories.create {
    return {
      create: {
        module: this.resourceMap[resourceConfig.type],
        args: [resourceConfig.config],
        isConstructor: true
      }
    };
  }
}
export = ConfigManager;