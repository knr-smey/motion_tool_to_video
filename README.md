# KineticCast Khmer (ខ្មែរ) 🎬⚡

> An automated script-to-kinetic-typography video engine tailored for the Khmer language with synchronized contextual animated icons, stickers, and a strict monochrome aesthetic.

---

## 📌 Project Overview

**KineticCast Khmer** transforms raw script text (history, artificial intelligence, finance, science, or storytelling) into high-energy, motion-graphic typography videos lasting anywhere from 1 to 10+ minutes. 

It eliminates the traditional manual timeline editing workflow by:
1. **Mathematical Pacing Engine:** Automatically computing on-screen durations from human reading speed without requiring a pre-recorded audio track.
2. **Khmer Script Parsing & Segmentation:** Breaking sentences intelligently using native Khmer typography rules and punctuation (`៕`, `၊`).
3. **Contextual Sticker Matching:** Scanning text for domain keywords to trigger floating vector icon badges (e.g., Angkor Wat 🏛️, AI & Computing 💻, Digital Payments/Bakong 💳).
4. **Monochrome High-Contrast Visuals:** A sleek, distraction-free Black & White aesthetic that highlights typography motion.

---

## 🛠️ Tech Stack & Architecture

This project is built using a modern, 100% open-source stack (free for individual developers and small teams):

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (React 19, TypeScript) | Application framework, API routes, and UI state |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Strict monochrome palette (`#000000`, `#FFFFFF`, neutral grays) |
| **Video Engine** | [Remotion](https://www.remotion.dev/) | Programmatic React-based video generation & MP4 rendering |
| **In-Browser Player** | `@remotion/player` | Real-time, client-side video preview and timeline scrubber |
| **Motion Physics** | Framer Motion & CSS Curves | Spring dynamics, kinetic reveals, and sticker float loops |
| **Khmer Word Breaking** | Native JS `Intl.Segmenter('km')` | Accurate phrase and word boundary detection for Khmer script |
| **Typography** | Google Fonts | **Moul** (Titles), **Battambang** (Impact), **Kantumruy Pro** (Body) |
| **Icons & Badges** | [Lucide React](https://lucide.dev/) | Clean, scalable vector stickers and controls |

---

## ⚙️ How It Works (Pipeline)

```
[ Raw Khmer Script Input ]
           │
           ▼
[ 1. Khmer Segmentation & Tokenization ]
     Uses Intl.Segmenter('km', { granularity: 'word' }) & Khmer delimiters (៕, ၊)
           │
           ▼
[ 2. Pacing & Timing Calculator ]
     Calculates frame duration based on WPM (Words Per Minute) + punctuation pauses
           │
           ▼
[ 3. Contextual Sticker & Style Assignment ]
     Matches keywords to Lucide icons & cycles through 4 kinetic layouts
           │
           ▼
[ 4. Remotion Dynamic Canvas ]
     ├─► Real-Time Web Preview (<Player />)
     └─► Server/Lambda Render (Headless Chromium + FFmpeg -> MP4)
```

---

## 🎨 Visual Styles & Templates (Monochrome)

The player cycles through 4 repeating visual formats to prevent viewer fatigue over 5–10 minute durations:

1. **Center Impact (Zoom Pop):** Elastic scale-up (`scale: 0.7 -> 1.05 -> 1.0`) with heavy Khmer *Moul* or *Battambang* font for punchy opening hooks and key revelations.
2. **Inverted Highlighter Sweep:** A pure white box sweeps behind focal words, inverting the text to pure black for emphasis.
3. **Staggered Word Cascade:** Multi-word phrases cascade downward with sequential micro-delays (`0.08s` per token).
4. **Minimal Character Scramble:** Rapid glyph cycling before locking into the target Khmer phrase for technological/scientific themes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kinetic-cast-khmer.git
   cd kinetic-cast-khmer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Launch the Remotion Studio (Standalone Video Preview):**
   ```bash
   npx remotion preview
   ```

---

## 📦 Project Directory Structure

```text
kinetic-cast-khmer/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Google fonts injection (Moul, Kantumruy Pro, Battambang)
│   │   └── page.tsx           # Main workspace UI (Script Editor + Player Deck)
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── ScriptInput.tsx       # Textarea with word counter & presets
│   │   │   └── ScenePlaylist.tsx     # Breakdown list of computed scenes
│   │   └── Video/
│   │       ├── PlayerDeck.tsx        # Timeline scrubber & transport buttons
│   │       ├── KineticStage.tsx      # Viewport container (16:9 & 9:16 toggle)
│   │       └── StickerBadge.tsx      # Animated Lucide icon pop-up badges
│   ├── remotion/
│   │   ├── Root.tsx           # Remotion composition definitions
│   │   ├── Composition.tsx    # Main sequential scene sequencer
│   │   └── scenes/
│   │       ├── CenterImpact.tsx
│   │       ├── HighlighterSweep.tsx
│   │       ├── WordCascade.tsx
│   │       └── CyberScramble.tsx
│   ├── lib/
│   │   ├── pacingEngine.ts    # Timing calculation & Khmer punctuation delays
│   │   ├── stickerMatcher.ts  # Keyword-to-icon heuristic engine
│   │   └── presets.ts         # Sample scripts (Angkor Wat, AI, Bakong)
├── tailwind.config.ts         # Strict monochrome palette rules
├── package.json
└── README.md
```

---

## 🧮 Pacing Calculation Logic

Without audio transcription, duration is computed as follows:

$$\text{Duration (seconds)} = \max\left(2.4, \frac{\text{Word Count} \times 60}{\text{WPM}}\right) + \text{Punctuation Delays}$$

* **Base Speed:** 145 Words Per Minute (adjustable from 120 to 180).
* **Khmer Full-Stop (`៕`):** $+0.60\text{s}$ pause.
* **Phrase Pause (`၊` or `,`):** $+0.30\text{s}$ pause.
* **Minimum Scene Floor:** $2.4\text{s}$ to ensure legibility of consonant clusters and subscripts.

---

## 📄 License & Attribution

- **Code:** Licensed under the [MIT License](LICENSE).
- **Fonts:** [SIL Open Font License](http://scripts.sil.org/OFL) for Google Fonts (*Moul*, *Battambang*, *Kantumruy Pro*).
- **Remotion:** Free for individuals, non-profits, and teams with up to 3 people.