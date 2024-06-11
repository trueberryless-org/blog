import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import starlightViewModes from "starlight-view-modes";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "Blog",
            social: {
                github: "https://github.com/trueberryless-org/blog",
            },
            logo: {
                light: "./src/assets/light-logo.png",
                dark: "./src/assets/dark-logo.png",
                replacesTitle: true,
            },
            plugins: [
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
                    },
                }),
                starlightViewModes({
                    zenModeShowTableOfContents: false,
                }),
            ],
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
