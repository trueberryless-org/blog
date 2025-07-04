import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightBlog from "starlight-blog";
import starlightCoolerCredit from "starlight-cooler-credit";
import starlightImageZoom from "starlight-image-zoom";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.trueberryless.org",
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
      routeMiddleware: "./src/routeData.ts",
      plugins: [
        starlightLinksValidator({
          exclude: ["/blog/tags/*"],
          errorOnRelativeLinks: false,
        }),
        starlightImageZoom(),
        starlightThemeRapide(),
        starlightCoolerCredit({
          credit: "Starlight Blog",
        }),
        starlightBlog({
          title: "Deep Thoughts",
          recentPostCount: 3,
          prevNextLinksOrder: "chronological",
          navigation: "none",
          metrics: {
            readingTime: true,
            words: "rounded",
          },
          authors: {
            trueberryless: {
              name: "Felix Schneider",
              title: "trueberryless",
              picture: "/trueberryless.png",
              url: "https://trueberryless.org",
            },
            clemens: {
              name: "Clemens Schlipfinger",
              picture: "/clemens.png",
              url: "https://www.linkedin.com/in/clemens-schlipfinger/",
            },
            hideoo: {
              name: "HiDeoo",
              picture: "/hideoo.png",
              url: "https://hideoo.dev",
            },
            frostybee: {
              name: "Frostybee",
              picture: "/frostybee.png",
              url: "https://github.com/frostybee",
            },
            ai: {
              name: "Artificial Intelligence",
              title: "Written with the help of AI",
              picture: "/ai.jpg",
            },
          },
        }),
      ],
      components: {
        MarkdownContent: "./src/components/MarkdownContent.astro",
        TableOfContents: "./src/components/TableOfContents.astro",
        Hero: "./src/components/Hero.astro",
        PageTitle: "./src/components/PageTitle.astro",
      },
      customCss: [
        "./src/styles/custom.css",
        "@fontsource-variable/atkinson-hyperlegible-next/wght.css",
        "@fontsource-variable/jetbrains-mono/wght.css",
      ],
      pagination: false,
    }),
  ],
  redirects: {
    "/": "/blog",
  },
});
