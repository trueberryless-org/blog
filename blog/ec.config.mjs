import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  plugins: [pluginCollapsibleSections()],
});
