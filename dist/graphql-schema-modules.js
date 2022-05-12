"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadModules = loadModules;
exports.mergeModules = mergeModules;

require("core-js/modules/es.error.cause.js");

require("babel-polyfill");

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

var _printer = require("graphql/language/printer");

var _deepExtend = _interopRequireDefault(require("deep-extend"));

var _requireAll = _interopRequireDefault(require("require-all"));

var _templateObject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function mergeModules() {
  let modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  const typeDefs = mergeTypeDefs(modules.filter(_ref => {
    let {
      typeDefs
    } = _ref;
    return !!typeDefs;
  }).map(_ref2 => {
    let {
      typeDefs
    } = _ref2;
    return typeDefs;
  }));
  const resolvers = mergeResolvers(modules.filter(_ref3 => {
    let {
      resolvers
    } = _ref3;
    return !!resolvers;
  }).map(_ref4 => {
    let {
      resolvers
    } = _ref4;
    return resolvers;
  }));
  return {
    typeDefs: [typeDefs],
    resolvers
  };
}

function loadModules(directory) {
  const modules = [];
  (0, _requireAll.default)({
    dirname: directory,
    recursive: true,

    resolve(mod) {
      modules.push(mod);
    }

  });
  return mergeModules(modules);
}

const typeDefsToStr = function typeDefsToStr() {
  let typeDefs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  if (typeof typeDefs === "string") {
    return typeDefs;
  } else if (typeof typeDefs === "function") {
    return typeDefsToStr(typeDefs());
  } else {
    return typeDefs.map(typeDef => typeDefsToStr(typeDef)).join("\n");
  }
};

const mergeTypeDefs = function mergeTypeDefs() {
  let typeDefs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  typeDefs = typeDefs.map(typeDefs => (0, _graphqlTag.default)(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n        ", "\n      "])), typeDefsToStr(typeDefs)));
  const rootTypes = {};
  typeDefs.forEach(graphql => {
    graphql.definitions.forEach(def => {
      const name = def.name.value;

      if (rootTypes[name]) {
        // throw error if enum with same name is defined twice
        if (rootTypes[name].kind === "EnumTypeDefinition") {
          throw new Error("duplicate enum definition '".concat(rootTypes[name].name.value, "'"));
        }

        rootTypes[name].fields = rootTypes[name].fields.concat(def.fields);
      } else {
        rootTypes[name] = def;
      }
    });
  });
  return (0, _printer.print)({
    kind: "Document",
    definitions: Object.values(rootTypes)
  });
};

const mergeResolvers = function mergeResolvers() {
  let resolvers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  const rootResolvers = {};
  resolvers.forEach(_resolvers => {
    (0, _deepExtend.default)(rootResolvers, _resolvers);
  });
  return rootResolvers;
};