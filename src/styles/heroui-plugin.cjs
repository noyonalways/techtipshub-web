// Local Tailwind v4 adapter for HeroUI's theme plugin.
// `@heroui/theme/plugin` is an ESM module that only exports the named
// `heroui()` function (no default export), which Tailwind's `@plugin`
// directive cannot use directly. This shim exposes it as the default export.
const { heroui } = require("@heroui/theme/plugin");

module.exports = heroui;
module.exports.default = heroui;
