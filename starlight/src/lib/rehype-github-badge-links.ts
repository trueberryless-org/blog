import { h } from "hastscript";
import { visit } from "unist-util-visit";

export default function rehypeGitHubBadgeLinks() {
  return (tree) => {
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

          // Add GitHub badge class
          node.properties.className = (node.properties.className || []).concat(
            "gh-badge"
          );

          // Build avatar image
          const avatarImg = h("img", {
            src: `https://github.com/${username}.png`,
            alt: username,
          });

          // Prepend avatar image to original children
          node.children.unshift(avatarImg);
        }
      }
    });
  };
}
