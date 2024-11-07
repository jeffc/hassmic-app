const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
	const config = getDefaultConfig(__dirname);

	const { resolver } = config;

	config.resolver = {
		...resolver,
		unstable_enablePackageExports: true,
	};

	return config;
})();
