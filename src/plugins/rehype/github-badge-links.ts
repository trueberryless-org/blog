import { h } from "hastscript";
import { visit } from "unist-util-visit";

export default function rehypeGitHubBadgeLinks() {
  return (tree: any, file: any) => {
    const frontmatter = file.data?.astro?.frontmatter ?? {};

    if (frontmatter.badgeLinks === false) {
      return;
    }

    visit(tree, "element", (node) => {
      if (
        node.tagName === "a" &&
        typeof node.properties?.href === "string" &&
        node.properties.href.startsWith("https://github.com/")
      ) {
        const match = node.properties.href.match(
          /^https:\/\/github\.com\/([\w-]+)\/?$/
        );
        if (match) {
          const username = match[1];

          node.properties.className = (node.properties.className || []).concat(
            "gh-badge"
          );

          const avatarImg = h("img", {
            src: `https://github.com/${username}.png`,
            alt: username,
          });

          node.children.unshift(avatarImg);
        }
      }
    });
  };
}
