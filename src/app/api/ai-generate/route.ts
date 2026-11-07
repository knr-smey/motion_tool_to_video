import { NextResponse } from "next/server";
import type { SceneLayout } from "@/lib/segmentation";

export interface GeneratedScene {
  text: string;
  layout: SceneLayout;
  nodes?: [string, string, string];
  durationSeconds?: number;
}

export interface AiGenerateResponse {
  success: boolean;
  source: string;
  topic: string;
  scenes: GeneratedScene[];
  script: string;
  message?: string;
}

// Built-in intelligent concept knowledge base
const TOPIC_KNOWLEDGE_BASE: Record<
  string,
  {
    km: GeneratedScene[];
    en: GeneratedScene[];
  }
> = {
  api: {
    km: [
      {
        text: "API គឺជាស្ពានចម្លងទិន្នន័យរវាង Client និង Server យ៉ាងរហ័ស។",
        layout: "node-connector",
        nodes: ["Client App", "REST API", "Database"],
        durationSeconds: 2.2,
      },
      {
        text: "នៅពេលអ្នកចុចប៊ូតុង Client នឹងផ្ញើ HTTP Request ទៅកាន់ API Gateway។",
        layout: "node-connector",
        nodes: ["HTTP Request", "API Gateway", "Endpoints"],
        durationSeconds: 2.0,
      },
      {
        text: "Server ដំណើរការ និងទាញយកទិន្នន័យពី Database ត្រឡប់មកវិញ។",
        layout: "cyber-scramble",
        durationSeconds: 1.8,
      },
      {
        text: "បន្ទាប់មក API ឆ្លើយតបជា JSON Data មកកាន់អេក្រង់របស់អ្នកភ្លាមៗ៕",
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ],
    en: [
      {
        text: "An API acts as a communication bridge between your Client and the Server.",
        layout: "node-connector",
        nodes: ["Client App", "REST API", "Database"],
        durationSeconds: 2.2,
      },
      {
        text: "When an action occurs, the Client sends an HTTP Request to the API endpoint.",
        layout: "node-connector",
        nodes: ["HTTP Request", "API Endpoint", "Controller"],
        durationSeconds: 2.0,
      },
      {
        text: "The backend server processes logic and queries the Database securely.",
        layout: "cyber-scramble",
        durationSeconds: 1.8,
      },
      {
        text: "Finally, the API delivers formatted JSON response data back to the user.",
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ],
  },
  database: {
    km: [
      {
        text: "Database គឺជាប្រព័ន្ធរក្សាទុក និងគ្រប់គ្រងទិន្នន័យប្រកបដោយសុវត្ថិភាព។",
        layout: "node-connector",
        nodes: ["Backend", "Query Engine", "SQL Database"],
        durationSeconds: 2.0,
      },
      {
        text: "នៅពេលមានសំណួរ Server នឹងរត់ SQL Query យ៉ាងរហ័ស។",
        layout: "node-connector",
        nodes: ["Server", "Redis Cache", "PostgreSQL"],
        durationSeconds: 2.0,
      },
      {
        text: "ទិន្នន័យរាប់លានជួរត្រូវបាន Index និងទាញយកត្រឹមតែប៉ុន្មានមិល្លីវិនាទីប៉ុណ្ណោះ៕",
        layout: "center-impact",
        durationSeconds: 2.0,
      },
    ],
    en: [
      {
        text: "Databases organize, store, and manage all your application data securely.",
        layout: "node-connector",
        nodes: ["Backend", "Query Engine", "SQL Database"],
        durationSeconds: 2.0,
      },
      {
        text: "The application queries records through high-speed caching and index tables.",
        layout: "node-connector",
        nodes: ["Server", "Redis Cache", "PostgreSQL"],
        durationSeconds: 2.0,
      },
      {
        text: "Millions of records are filtered and returned in just a few milliseconds.",
        layout: "center-impact",
        durationSeconds: 2.0,
      },
    ],
  },
  auth: {
    km: [
      {
        text: "User Authentication ផ្ទៀងផ្ទាត់អត្តសញ្ញាណអ្នកប្រើប្រាស់មុននឹងអនុញ្ញាត។",
        layout: "node-connector",
        nodes: ["User Login", "Auth Service", "Token Verify"],
        durationSeconds: 2.0,
      },
      {
        text: "Server បង្កើត JWT Encrypted Token ផ្ញើមកកាន់ Browser។",
        layout: "node-connector",
        nodes: ["Browser", "JWT Token", "API Guard"],
        durationSeconds: 2.0,
      },
      {
        text: "រាល់ Request បន្ទាប់ទាំងអស់ត្រូវបានការពារ និងមានសុវត្ថិភាពខ្ពស់បំផុត៕",
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ],
    en: [
      {
        text: "User Authentication verifies identity before granting access to protected routes.",
        layout: "node-connector",
        nodes: ["User Login", "Auth Service", "Token Verify"],
        durationSeconds: 2.0,
      },
      {
        text: "The server generates an encrypted JWT token and returns it to the client.",
        layout: "node-connector",
        nodes: ["Browser", "JWT Token", "API Guard"],
        durationSeconds: 2.0,
      },
      {
        text: "Every subsequent API request is verified and shielded with zero trust security.",
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ],
  },
  cloud: {
    km: [
      {
        text: "Cloud Computing ដំណើរការកម្មវិធីរបស់អ្នកនៅលើ Server សកលលោក។",
        layout: "node-connector",
        nodes: ["User Traffic", "Load Balancer", "Cloud Cluster"],
        durationSeconds: 2.2,
      },
      {
        text: "ប្រព័ន្ធ Auto-scaling បង្កើនម៉ាស៊ីនស្វ័យប្រវត្តិនៅពេលមានអ្នកប្រើប្រាស់ច្រើន។",
        layout: "node-connector",
        nodes: ["API Gateway", "Microservices", "Cloud DB"],
        durationSeconds: 2.0,
      },
      {
        text: "កម្មវិធីដំណើរការ ២៤ម៉ោងលើ២៤ម៉ោង ដោយគ្មានការរអាក់រអួលឡើយ៕",
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ],
    en: [
      {
        text: "Cloud Computing runs and scales your application across global data centers.",
        layout: "node-connector",
        nodes: ["User Traffic", "Load Balancer", "Cloud Cluster"],
        durationSeconds: 2.2,
      },
      {
        text: "Auto-scaling containers handle peak traffic spikes automatically.",
        layout: "node-connector",
        nodes: ["API Gateway", "Microservices", "Cloud DB"],
        durationSeconds: 2.0,
      },
      {
        text: "Your services stay online 24/7 with 99.99% high availability.",
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ],
  },
};

// Fallback dynamic generator for any custom topic
function generateGenericScenes(topic: string, lang: "km" | "en"): GeneratedScene[] {
  if (lang === "km") {
    return [
      {
        text: `${topic} គឺជាប្រធានបទដ៏សំខាន់ និងមានឥទ្ធិពលក្នុងបច្ចេកវិទ្យា។`,
        layout: "node-connector",
        nodes: ["Concept", topic.slice(0, 15), "Architecture"],
        durationSeconds: 2.2,
      },
      {
        text: `វាដំណើរការតាមរយៈការតភ្ជាប់ និងផ្លាស់ប្តូរទិន្នន័យរវាងផ្នែកនីមួយៗយ៉ាងស៊ីសង្វាក់។`,
        layout: "node-connector",
        nodes: ["Input / Request", "Processing Node", "Output / Result"],
        durationSeconds: 2.0,
      },
      {
        text: `លទ្ធផលត្រូវបានបង្ហាញ និងដំណើរការយ៉ាងមានប្រសិទ្ធភាពខ្ពស់៕`,
        layout: "center-impact",
        durationSeconds: 1.8,
      },
    ];
  }

  return [
    {
      text: `${topic} is a foundational concept in modern software architecture.`,
      layout: "node-connector",
      nodes: ["Client Input", topic.slice(0, 15), "Core Engine"],
      durationSeconds: 2.2,
    },
    {
      text: "It orchestrates data flow and connects distributed components seamlessly.",
      layout: "node-connector",
      nodes: ["Request Data", "Pipeline Logic", "Response Delivery"],
      durationSeconds: 2.0,
    },
    {
      text: "The end result delivers high performance, reliability, and scale.",
      layout: "center-impact",
      durationSeconds: 1.8,
    },
  ];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = (body.prompt || "").trim();
    const lang: "km" | "en" = body.language === "en" ? "en" : "km";
    const source: string = body.source || "auto";
    const ollamaUrl: string = body.ollamaUrl || "http://127.0.0.1:11434";
    const ollamaModel: string = body.ollamaModel || "llama3";

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "Please provide a topic or prompt." },
        { status: 400 }
      );
    }

    // Attempt 1: If user requested Local AI (Ollama), try connecting to localhost:11434
    if (source === "local-ollama" || source === "auto") {
      try {
        const systemPrompt = `You are an expert kinetic motion typography video explainer director.
Given a topic, output a structured video script broken into 3 to 4 sequential scenes explaining the concept step-by-step.
Always respond in strictly valid JSON matching this schema:
{
  "scenes": [
    {
      "text": "sentence text (in ${lang === "km" ? "Khmer" : "English"})",
      "layout": "node-connector" | "center-impact" | "highlighter-sweep" | "word-cascade" | "cyber-scramble",
      "nodes": ["Node 1", "Node 2", "Node 3"],
      "durationSeconds": 1.8
    }
  ]
}
Output only the JSON. No markdown fences, no conversational prose.`;

        const response = await fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: `Explain this topic clearly: "${prompt}". Language: ${lang === "km" ? "Khmer" : "English"}.`,
            system: systemPrompt,
            stream: false,
            format: "json",
          }),
          // 4-second timeout to check if Ollama is running
          signal: AbortSignal.timeout(4500),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.response);
          if (Array.isArray(parsed?.scenes) && parsed.scenes.length > 0) {
            const scenes: GeneratedScene[] = parsed.scenes.map((s: Partial<GeneratedScene>) => ({
              text: s.text || prompt,
              layout: s.layout || "node-connector",
              nodes: s.nodes || ["Client", "API", "Database"],
              durationSeconds: s.durationSeconds || 2.0,
            }));

            const script = scenes.map((s) => s.text).join("\n");
            return NextResponse.json({
              success: true,
              source: `Local AI (${ollamaModel})`,
              topic: prompt,
              scenes,
              script,
            });
          }
        }
      } catch {
        // Ollama not reachable, fall through to smart built-in engine
      }
    }

    // Attempt 2: Smart Built-in Topic & Concept Engine
    const lower = prompt.toLowerCase();
    let matchedScenes: GeneratedScene[] | null = null;

    if (lower.includes("api") || lower.includes("endpoint") || lower.includes("rest") || lower.includes("អេសភីអាយ")) {
      matchedScenes = TOPIC_KNOWLEDGE_BASE.api[lang];
    } else if (lower.includes("database") || lower.includes("sql") || lower.includes("data") || lower.includes("ទិន្នន័យ")) {
      matchedScenes = TOPIC_KNOWLEDGE_BASE.database[lang];
    } else if (lower.includes("auth") || lower.includes("security") || lower.includes("login") || lower.includes("jwt") || lower.includes("សុវត្ថិភាព")) {
      matchedScenes = TOPIC_KNOWLEDGE_BASE.auth[lang];
    } else if (lower.includes("cloud") || lower.includes("server") || lower.includes("cluster") || lower.includes("សឺវើរ")) {
      matchedScenes = TOPIC_KNOWLEDGE_BASE.cloud[lang];
    } else {
      matchedScenes = generateGenericScenes(prompt, lang);
    }

    const script = matchedScenes.map((s) => s.text).join("\n");

    return NextResponse.json({
      success: true,
      source: "Smey-Motion AI Concept Engine",
      topic: prompt,
      scenes: matchedScenes,
      script,
      message: source === "local-ollama" ? "Ollama was not reachable at localhost:11434, used Smart Explainer Engine." : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
