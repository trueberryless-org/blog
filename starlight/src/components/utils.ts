import starlightConfig from "virtual:starlight/user-config";

export function isAnyBlogPostPage(slug: string) {
  return (
    new RegExp(
      `^${getPathWithLocale(
        "blog",
        getLocaleFromPath(slug)
      )}/(?!(\\d+/?|tags/.+|authors/.+)$).+$`
    ).exec(slug) !== null
  );
}

function getPathWithLocale(path: string, locale: Locale): string {
  const pathLocale = getLocaleFromPath(path);
  if (pathLocale === locale) return path;
  locale = locale ?? "";
  if (pathLocale === path) return locale;
  if (pathLocale)
    return stripTrailingSlash(
      path.replace(`${pathLocale}/`, locale ? `${locale}/` : "")
    );
  return path
    ? `${stripTrailingSlash(locale)}/${stripLeadingSlash(path)}`
    : locale;
}

function getLocaleFromPath(path: string): Locale {
  const baseSegment = path.split("/")[0];
  return starlightConfig.locales &&
    baseSegment &&
    baseSegment in starlightConfig.locales
    ? baseSegment
    : undefined;
}

function stripLeadingSlash(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }

  return path.slice(1);
}

function stripTrailingSlash(path: string) {
  if (!path.endsWith("/")) {
    return path;
  }

  return path.slice(0, -1);
}

type Locale = string | undefined;
