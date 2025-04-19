// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

import robotsTxt from "astro-robots-txt";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://astro-blog-template-trueberryless.netlify.app",
  integrations: [expressiveCode(), mdx(), sitemap(), svelte(), robotsTxt()],
});