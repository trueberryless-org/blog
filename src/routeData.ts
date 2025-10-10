import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import fs from "fs";
import path from "path";

export const onRequest = defineRouteMiddleware((context) => {
  const routeId = ["blog", ""].includes(context.locals.starlightRoute.id)
    ? "blog/deep-thoughts"
    : context.locals.starlightRoute.id;

  // Directory of your public assets
  const publicDir = path.join(process.cwd(), "public");

  // Possible image extensions
  const extensions = [".png", ".jpg", ".webp"];

  // Find the first matching image file
  const foundExt = extensions.find((ext) =>
    fs.existsSync(path.join(publicDir, `${routeId}${ext}`))
  );

  // Build the final URL
  const ogImageUrl = new URL(
    `/${routeId}${foundExt ?? ".jpg"}`, // default fallback
    context.site
  );

  const { head, entry } = context.locals.starlightRoute;

  // Common meta tags
  const metaTags = [
    { property: "og:image", content: ogImageUrl.href },
    { property: "twitter:domain", content: context.site?.hostname },
    {
      property: "twitter:url",
      content: `${context.site?.href}${entry.id}`,
    },
    { name: "twitter:title", content: entry.data.title },
    { name: "twitter:description", content: entry.data.description },
    { name: "twitter:image", content: ogImageUrl.href },
  ];

  metaTags.forEach((meta) => {
    head.push({ tag: "meta", attrs: meta });
  });
});
