const { createRunOncePlugin } = require("expo/config-plugins");

const withParsely = require("./plugin/build/index").default;

const pkg = require("./package.json");

module.exports = createRunOncePlugin(withParsely, pkg.name, pkg.version);
