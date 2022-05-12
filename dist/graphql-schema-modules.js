"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeModules = mergeModules;
exports.loadModules = loadModules;

var _graphqlTag = require("graphql-tag");

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

var _printer = require("graphql/language/printer");

var _deepExtend = require("deep-extend");

var _deepExtend2 = _interopRequireDefault(_deepExtend);

var _requireAll = require("require-all");

var _requireAll2 = _interopRequireDefault(_requireAll);

var _values = require("core-js/fn/object/values");

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mergeModules(modules = []) {
  const typeDefs = mergeTypeDefs(modules.filter(({
    typeDefs
  }) => !!typeDefs).map(({
    typeDefs
  }) => typeDefs));
  const resolvers = mergeResolvers(modules.filter(({
    resolvers
  }) => !!resolvers).map(({
    resolvers
  }) => resolvers));
  return {
    typeDefs: [typeDefs],
    resolvers
  };
}

;

function loadModules(directory) {
  const modules = [];
  (0, _requireAll2.default)({
    dirname: directory,
    recursive: true,

    resolve(mod) {
      modules.push(mod);
    }

  });
  return mergeModules(modules);
}

;

const typeDefsToStr = (typeDefs = []) => {
  if (typeof typeDefs === 'string') {
    return typeDefs;
  } else if (typeof typeDefs === 'function') {
    return typeDefsToStr(typeDefs());
  } else {
    return typeDefs.map(typeDef => typeDefsToStr(typeDef)).join('\n');
  }
};

const mergeTypeDefs = (typeDefs = []) => {
  typeDefs = typeDefs.map(typeDefs => _graphqlTag2.default`${typeDefsToStr(typeDefs)}`);
  const rootTypes = {};
  typeDefs.forEach(graphql => {
    graphql.definitions.forEach(def => {
      const name = def.name.value;

      if (rootTypes[name]) {
        // throw error if enum with same name is defined twice
        if (rootTypes[name].kind === 'EnumTypeDefinition') {
          throw new Error(`duplicate enum definition '${rootTypes[name].name.value}'`);
        }

        rootTypes[name].fields = rootTypes[name].fields.concat(def.fields);
      } else {
        rootTypes[name] = def;
      }
    });
  });
  return (0, _printer.print)({
    kind: 'Document',
    definitions: Object.values(rootTypes)
  });
};

const mergeResolvers = (resolvers = []) => {
  const rootResolvers = {};
  resolvers.forEach(_resolvers => {
    (0, _deepExtend2.default)(rootResolvers, _resolvers);
  });
  return rootResolvers;
};