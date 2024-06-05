import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";

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
                    },
                }),
            ],
            customCss: ["./src/styles/custom.css"],
            pagination: false,
            credits: true,
        }),
    ],
    redirects: {
        "/": "/blog",
    },
});
