import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  if (context.locals.starlightRoute.id === "blog") return;
  const ogImageUrl = new URL(
    `/${context.locals.starlightRoute.id}.png`,
    context.site
  );

  const { head } = context.locals.starlightRoute;

  head.push({
    tag: "meta",
    attrs: { property: "og:image", content: ogImageUrl.href },
  });
  head.push({
    tag: "meta",
    attrs: { name: "twitter:image", content: ogImageUrl.href },
  });
});
