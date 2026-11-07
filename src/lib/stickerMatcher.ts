export type StickerCategory =
  | "history"
  | "technology"
  | "finance"
  | "science"
  | "api"
  | "server"
  | "database"
  | "code"
  | "network"
  | "security"
  | "general";

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
    category: "api",
    label: "API",
    keywords: [
      "API",
      "api",
      "REST",
      "GraphQL",
      "endpoint",
      "request",
      "response",
      "webhook",
      "interface",
      "ស្ពាន",
      "អេសភីអាយ",
    ],
  },
  {
    category: "server",
    label: "Backend Server",
    keywords: ["server", "Server", "សឺវើរ", "backend", "host", "node"],
  },
  {
    category: "database",
    label: "Database & Data",
    keywords: ["database", "Database", "ទិន្នន័យ", "SQL", "data", "storage", "mongo"],
  },
  {
    category: "code",
    label: "Code & Logic",
    keywords: ["code", "coding", "developer", "program", "កូដ", "software", "functions", "script"],
  },
  {
    category: "network",
    label: "Network & Flow",
    keywords: ["network", "internet", "connect", "បណ្តាញ", "flow", "protocol", "http", "https"],
  },
  {
    category: "security",
    label: "Security & Auth",
    keywords: ["security", "token", "auth", "key", "password", "សុវត្ថិភាព", "secure", "jwt"],
  },
  {
    category: "history",
    label: "Angkor Heritage",
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
    label: "Science & Space",
    keywords: ["វិទ្យាសាស្ត្រ", "អវកាស", "science", "space", "physics"],
  },
];

export function matchStickers(text: string): StickerMatch[] {
  const matches: StickerMatch[] = [];
  const seen = new Set<StickerCategory>();

  for (const rule of STICKER_RULES) {
    if (seen.has(rule.category)) continue;
    const hit = rule.keywords.some((keyword) => {
      // Case-insensitive match for latin words, direct match for Khmer
      const regex = new RegExp(`(^|\\W)${keyword}(\\W|$)`, "i");
      return text.includes(keyword) || regex.test(text);
    });
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
