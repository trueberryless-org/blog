import starlight from "@astrojs/starlight";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { defineConfig } from "astro/config";
import starlightBlog from "starlight-blog";
import starlightImageZoom from "starlight-image-zoom";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Blog",
      social: [
        {
          icon: "blueSky",
          label: "BlueSky",
          href: "https://bsky.app/profile/trueberryless.org",
        },
        {
          icon: "mastodon",
          label: "Mastodon",
          href: "https://mastodon.social/@trueberryless",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/trueberryless-org/blog",
        },
      ],
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
        {
          tag: "script",
          attrs: {
            src: "https://rybbit-be.lou.gg/api/script.js",
            "data-site-id": "3",
            defer: true,
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
          recentPostCount: 3,
          prevNextLinksOrder: "chronological",
          navigation: "none",
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
        }),
        // starlightViewModes(),
        {
          name: "blog-separation-character",
          hooks: {
            "i18n:setup"({ injectTranslations }) {
              injectTranslations({
                en: {
                  "starlightBlog.post.lastUpdate":
                    ' • Last update: <time datetime="{{isoDate}}">{{date, datetime(dateStyle: medium)}}</time>',
                },
              });
            },
            "config:setup"() {},
          },
        },
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
