import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import lunaria from "@lunariajs/starlight";
import { defineConfig } from "astro/config";
import { config as loadDotenv } from "dotenv";
import starlightBlog from "starlight-blog";
import starlightCoolerCredit from "starlight-cooler-credit";
import starlightGiscus from "starlight-giscus";
import starlightImageZoom from "starlight-image-zoom";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";

import rehypeAutolinkHeadings from "./src/plugins/rehype/autolink-headings";
import rehypeGitHubBadgeLinks from "./src/plugins/rehype/github-badge-links";

loadDotenv();

const GISCUS_REPO_ID = process.env.GISCUS_REPO_ID;
const GISCUS_CATEGORY_ID = process.env.GISCUS_CATEGORY_ID;

if (!GISCUS_REPO_ID || !GISCUS_CATEGORY_ID) {
  console.warn(
    "[giscus] Skipping Giscus integration: GISCUS_REPO_ID or GISCUS_CATEGORY_ID not set."
  );
}

// https://astro.build/config
export default defineConfig({
  site: "https://blog.trueberryless.org",
  integrations: [
    starlight({
      title: "Deep Thoughts",
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
        baseUrl: "https://github.com/trueberryless-org/blog/tree/main/",
      },
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        fr: {
          label: "French",
          lang: "fr",
        },
        de: {
          label: "Deutsch",
          lang: "de",
        },
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
            src: "https://rybbit.lou.gg/api/script.js",
            "data-site-id": "3",
            defer: true,
          },
        },
      ],
      routeMiddleware: "./src/routeData.ts",
      plugins: [
        lunaria({
          sync: true,
        }),
        starlightLinksValidator({
          exclude: [
            "/blog/tags/*",
            "/blog/authors/*",
            "/de/blog/tags/*",
            "/de/blog/authors/*",
            "/fr/blog/tags/*",
            "/fr/blog/authors/*",
          ],
          errorOnRelativeLinks: false,
          errorOnInvalidHashes: false,
        }),
        starlightImageZoom(),
        ...(GISCUS_REPO_ID && GISCUS_CATEGORY_ID
          ? [
              starlightGiscus({
                repo: "trueberryless-org/blog",
                repoId: GISCUS_REPO_ID,
                category: "Comments",
                categoryId: GISCUS_CATEGORY_ID,
                lazy: true,
              }),
            ]
          : []),
        starlightBlog({
          title: "Deep Thoughts",
          postCount: 7,
          recentPostCount: 5,
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
              url: "https://clemens.steinanet.at/",
            },
            hideoo: {
              name: "HiDeoo",
              picture: "/hideoo.png",
              url: "https://hideoo.dev",
            },
            frostybee: {
              name: "FrostyBee",
              picture: "/frostybee.png",
              url: "https://github.com/frostybee",
            },
            lan: {
              name: "Lan",
              picture: "/lan.png",
              url: "https://github.com/LanHikari22",
            },
            ai: {
              name: "Artificial Intelligence",
              title: "Written with the help of AI",
              picture: "/ai.jpg",
            },
          },
        }),
        starlightCoolerCredit({
          credit: {
            title: "Credits",
            description: "View all credits of this blog →",
            href: "https://blog.trueberryless.org/credits",
          },
        }),
        starlightThemeRapide(),
      ],
      components: {
        MarkdownContent: "./src/components/MarkdownContent.astro",
        Hero: "./src/components/Hero.astro",
        PageTitle: "./src/components/PageTitle.astro",
      },
      customCss: ["./src/styles/index.css"],
      markdown: {
        headingLinks: false,
      },
      pagination: false,
    }),
  ],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAutolinkHeadings,
      rehypeGitHubBadgeLinks,
    ],
  },
});
