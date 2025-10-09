import { h } from "hastscript";
import rehypeAutolinkHeadings, { type Options } from "rehype-autolink-headings";

export const rehypeAutolinkHeadingsOptions = {
  properties: {
    class: "anchor-link",
  },
  behavior: "after",
  group: ({ tagName }: { tagName: string }) =>
    h("div", {
      tabIndex: -1,
      class: `heading-wrapper level-${tagName}`,
    }),
  content: () => [AnchorLinkIcon],
} as const satisfies Options;

const AnchorLinkIcon = h(
  "span",
  {
    ariaHidden: "true",
    class: "anchor-icon",
  },
  h(
    "svg",
    {
      width: 16,
      height: 16,
      viewBox: "0 0 24 24",
    },
    h("path", {
      fill: "currentColor",
      d: "M11.02.02c.55.1.9.62.8 1.16l-.95 5.19h4.91L16.81.82a1 1 0 1 1 1.96.36l-.95 5.19H23a1 1 0 1 1 0 2h-5.55l-1.34 7.26h5.15a1 1 0 1 1 0 2h-5.52l-1.02 5.55a1 1 0 0 1-1.97-.36l.96-5.19H8.8l-1.03 5.55a1 1 0 1 1-1.96-.36l.95-5.19H1a1 1 0 0 1 0-2h6.13l1.34-7.26H3.32a1 1 0 0 1 0-2h5.52L9.86.82a1 1 0 0 1 1.16-.8Zm-.52 8.35-1.34 7.26h4.92l1.33-7.26h-4.9Z",
    })
  )
);

export default function () {
  return rehypeAutolinkHeadings(rehypeAutolinkHeadingsOptions);
}
