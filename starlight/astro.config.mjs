import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import starlightViewModes from "starlight-view-modes";
import starlightThemeRapide from "starlight-theme-rapide";
import starlightImageZoom from "starlight-image-zoom";
import starlightLinksValidator from "starlight-links-validator";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Blog",
      social: {
        github: "https://github.com/trueberryless-org/blog",
        patreon: "https://www.patreon.com/trueberryless",
      },
      editLink: {
        baseUrl:
          "https://github.com/trueberryless-org/blog/tree/main/starlight/",
      },
      lastUpdated: true,
      logo: {
        light: "./src/assets/light-logo.png",
        dark: "./src/assets/dark-logo.png",
        replacesTitle: true,
      },
      head: [
        {
          tag: "meta",
          attrs: {
            name: "fediverse:creator",
            content: "@trueberryless@mastodon.social",
          },
        },
      ],
      plugins: [
        starlightLinksValidator({
          exclude: ["/blog/tags/*"],
        }),
        starlightImageZoom(),
        starlightThemeRapide(),
        starlightBlog({
          title: "Deep Thoughts",
          authors: {
            trueberryless: {
              name: "trueberryless",
              title: "Felix Schneider",
              picture: "/trueberryless.png", // Images in the `public` directory are supported.
              url: "https://trueberryless.org",
            },
            clemens: {
              name: "clemens",
              title: "Clemens Schlipfinger",
              picture: "/clemens.png", // Images in the `public` directory are supported.
              url: "https://www.linkedin.com/in/clemens-schlipfinger/",
            },
            chatgpt: {
              name: "ChatGPT",
              picture: "/chatgpt.png", // Images in the `public` directory are supported.
              url: "https://chatgpt.com/",
            },
          },
          prevNextLinksOrder: "chronological",
        }),
        // starlightViewModes({
        //   zenModeShowTableOfContents: false,
        // }),
      ],
      components: {
        MarkdownContent: "./src/components/MarkdownContent.astro",
      },
      customCss: [
        "./src/styles/custom.css",
        "@fontsource/nova-square/400.css",
        "@fontsource/inria-sans/400.css",
        "@fontsource-variable/jetbrains-mono/wght.css",
      ],
      pagination: false,
      credits: true,
      expressiveCode: {
        plugins: [pluginCollapsibleSections()],
      },
    }),
  ],
  redirects: {
    "/": "/blog",
  },
});
