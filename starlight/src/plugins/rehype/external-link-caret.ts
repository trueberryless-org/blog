import { visit } from "unist-util-visit";

/**
 * Rehype plugin to append "^" to all external links
 */
export default function rehypeExternalLinkCaret() {
  const domain = ["localhost", "blog.trueberryless.org"];

  return function (tree: any) {
    visit(tree, "element", (node) => {
      if (
        node.tagName === "a" &&
        node.properties &&
        typeof node.properties.href === "string"
      ) {
        const href = node.properties.href;

        const isExternal =
          href.startsWith("http") &&
          !domain.some((d) => href.includes(d)) &&
          !href.startsWith("/") &&
          !href.startsWith("#");

        const isGitHubProfile = /^https:\/\/github\.com\/[\w-]+\/?$/.test(href);

        if (isExternal && !isGitHubProfile && Array.isArray(node.children)) {
          node.children.push({
            type: "element",
            tagName: "span",
            properties: { className: ["external-link-tiny-caret"] },
            children: [{ type: "text", value: "^" }],
          });
        }
      }
    });
  };
}
