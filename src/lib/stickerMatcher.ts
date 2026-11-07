export type StickerCategory = "history" | "technology" | "finance" | "science" | "general";

// Deliberately data-only (no component references): Scene objects carrying
// this flow through Remotion's composition props, which get JSON-serialized
// when crossing from the render CLI into the headless browser. A function
// value here would silently become `undefined` on the other side. The
// actual icon component is resolved from `category` at render time instead
// (see STICKER_ICON_BY_CATEGORY in components/Video/icons.tsx).
export interface StickerMatch {
  category: StickerCategory;
  label: string;
}

interface StickerRule {
  category: StickerCategory;
  label: string;
  keywords: string[];
}

const STICKER_RULES: StickerRule[] = [
  {
    category: "history",
    label: "Angkor Wat",
    keywords: ["អង្គរ", "ប្រាសាទ", "ខ្មែរ", "Angkor", "temple"],
  },
  {
    category: "technology",
    label: "AI & Computing",
    keywords: [
      "ម៉ាស៊ីន",
      "បញ្ញាសិប្បនិម្មិត",
      "កុំព្យូទ័រ",
      "AI",
      "algorithm",
      "robot",
      "computer",
    ],
  },
  {
    category: "finance",
    label: "Digital Payments",
    keywords: ["ប្រាក់", "បាគង", "Bakong", "ទូទាត់", "payment", "finance", "bank"],
  },
  {
    category: "science",
    label: "Science",
    keywords: ["វិទ្យាសាស្ត្រ", "អវកាស", "science", "space", "physics"],
  },
];

export function matchStickers(text: string): StickerMatch[] {
  const matches: StickerMatch[] = [];
  const seen = new Set<StickerCategory>();

  for (const rule of STICKER_RULES) {
    if (seen.has(rule.category)) continue;
    const hit = rule.keywords.some((keyword) => text.includes(keyword));
    if (hit) {
      matches.push({ category: rule.category, label: rule.label });
      seen.add(rule.category);
    }
  }

  if (matches.length === 0) {
    matches.push({ category: "general", label: "Highlight" });
  }

  return matches;
}
