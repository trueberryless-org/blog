import starlightConfig from "virtual:starlight/user-config";

export function sameStringIgnoreLeadingAndTrailingSlashes(
  href: string,
  id: string
): boolean {
  return (
    stripLeadingSlash(stripTrailingSlash(href)) ===
    stripLeadingSlash(stripTrailingSlash(id))
  );
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
