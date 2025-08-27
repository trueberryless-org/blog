import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  const ogImageUrl = new URL(
    `/${["blog", ""].includes(context.locals.starlightRoute.id) ? "blog/deep-thoughts" : context.locals.starlightRoute.id}.png`,
    context.site
  );

  const { head, entry } = context.locals.starlightRoute;

  head.push({
    tag: "meta",
    attrs: { property: "og:image", content: ogImageUrl.href },
  });
  head.push({
    tag: "meta",
    attrs: { property: "twitter:domain", content: context.site?.hostname },
  });
  head.push({
    tag: "meta",
    attrs: {
      property: "twitter:url",
      content: `${context.site?.href}${entry.id}`,
    },
  });
  head.push({
    tag: "meta",
    attrs: { name: "twitter:title", content: entry.data.title },
  });
  head.push({
    tag: "meta",
    attrs: { name: "twitter:description", content: entry.data.description },
  });
  head.push({
    tag: "meta",
    attrs: { name: "twitter:image", content: ogImageUrl.href },
  });
});
