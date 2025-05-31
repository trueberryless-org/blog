import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
  plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
  defaultProps: {
    // Enable line numbers by default
    showLineNumbers: true,
    // But disable line numbers for certain languages
    overridesByLang: {
      bash: {
        showLineNumbers: false,
      },
    },
  },
};
