import { visit } from "unist-util-visit";

export default function remarkArrows() {
  // Ordered longest → shortest
  const replacements: Record<string, string> = {
    // Long arrows
    "<--": "⟵",
    "-->": "⟶",
    "<-->": "⟷",
    "<==": "⟸",
    "==>": "⟹",
    "<==>": "⟺",
    "<--|": "⟻",
    "|-->": "⟼",
    "<==|": "⟽",
    "|==>": "⟾",
    "~>": "⟿",

    // Basic arrows
    "<-": "←",
    "->": "→",

    // Triangle-headed
    "<|-": "⭠",
    "-|>": "⭢",
    "<-|>": "⭤",

    // Double triangle
    "|><|": "⮂",
  };

  // Build a global regex matching all Latin patterns
  const pattern = new RegExp(
    Object.keys(replacements)
      // Escape special regex chars
      .sort((a, b) => b.length - a.length)
      .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|"),
    "g"
  );

  return (tree: any, file: any) => {
    visit(tree, "text", (node: any) => {
      if (typeof node.value === "string") {
        node.value = node.value.replace(
          pattern,
          (match: string) => replacements[match]
        );
      }
    });
  };
}
