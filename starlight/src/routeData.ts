import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  var { head, siteTitleHref } = context.locals.starlightRoute;

  siteTitleHref = "/blog/";

  if (!(context.locals.starlightRoute.id === "blog")) {
    const ogImageUrl = new URL(
      `/${context.locals.starlightRoute.id}.png`,
      context.site
    );
    head.push({
      tag: "meta",
      attrs: { property: "og:image", content: ogImageUrl.href },
    });
    head.push({
      tag: "meta",
      attrs: { name: "twitter:image", content: ogImageUrl.href },
    });
  }
});
