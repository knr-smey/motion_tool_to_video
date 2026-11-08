# KIT_HXkat (ខ្មែរ) 🎬⚡

> A motion-centric video studio and kinetic choreography engine tailored for the Khmer language. Automates script-driven typography, Bento UI callout animations, and 3D device staging with a strict high-contrast dark aesthetic.

---

## 📌 Project Overview

**KIT_HXkat** bridges the gap between automated script generation and dedicated motion graphics suites (like Jitter, Rotato, and Apple Keynote). Instead of acting as a generic timeline video trimmer, it focuses purely on **choreographed motion presets**, expressive Khmer typography, and tech-explainer UI visual cards.

### Core Capabilities
1. **Mathematical Pacing & Dynamic Sync:** Computes on-screen timing automatically from reading speed (WPM) or snaps layers directly to voiceover audio tracks.
2. **Khmer Script Tokenization:** Breaks sentences with native phrase boundary detection via `Intl.Segmenter('km')` and punctuation rules (`៕`, `ៗ`, `៖`, `៛`, `ៗ`, `‹`, `›`, `«`, `»`, `!`, `?`).
3. **Motion Preset Library:** Instantly stacks spring-physics animations across typography, floating Bento cards, and 3D device mockups.
4. **Bento UI & Floating Callouts:** Generates floating notification badges, chat cards, and contextual alert boxes in 3D perspective space.
5. **Monochrome / Slate Visuals:** A sleek, high-contrast palette (`#000000`, `#0F1015`, subtle borders, and balanced accents) built for tech storytelling.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (React 19, TypeScript) | Studio workspace, layout state, and route handlers |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/) | Dark-mode UI, custom controls, and typography scales |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Global motion preset, layer inspector, and scene graph state |
| **Video Engine** | [Remotion](https://www.remotion.dev/) | Programmatic React-based canvas, spring dynamics, & MP4 rendering |
| **Real-Time Preview** | `@remotion/player` | In-browser canvas playback and scrubbing controls |
| **Khmer Segmentation** | Native `Intl.Segmenter('km')` | Consonant cluster, word, and clause boundary detection |
| **Typography** | Google Fonts | **Moul** (Titles/Headers), **Battambang** (Impact), **Kantumruy Pro** (Body) |
| **Icons & Badges** | [Lucide React](https://lucide.dev/) | Contextual vector stickers and UI callout icons |

---

## 🎨 Motion Presets & Choreography

KIT_HXkat organizes animations into three distinct motion classes:

### 1. Kinetic Typography
* **Center Impact (Zoom Pop):** Elastic scale-up (`scale: 0.7 → 1.05 → 1.0`) with Khmer *Moul* or *Battambang* for key hooks.
* **Inverted Highlighter Sweep:** A high-contrast sweep background inverting text color to highlight critical nouns and figures.
* **Staggered Word Cascade:** Sequential downward drop with configurable micro-delays (`0.06s`–`0.12s` per Khmer word token).
* **Glyph Scramble:** Rapid pseudo-character cycling before locking into the target Khmer phrase for tech and cyber narratives.

### 2. Bento UI & Floating Callouts
* **Floating Z-Cards:** Notification and message bubbles floating on the side with natural spring entry (`stiffness: 120, damping: 14`).
* **Warning & Alert Badges:** Angled status stamps with glowing borders (e.g., account alerts, price tags, transaction confirmations).
* **Sticker Popups:** Automated domain keyword triggers (e.g., 🏛️ Heritage, 💳 Bakong/Finance, 💻 Computing).

### 3. 3D Device Staging
* **Isometric Phone Framing:** Tilted 3D device container showcasing application screens, chats, or transfer flows with smooth camera zooms and depth lighting.

---

## 📦 Project Directory Structure

```text
kit-hx-kat/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Font declarations (Moul, Kantumruy Pro, Battambang)
│   │   └── page.tsx                # Studio Workspace (Presets + Canvas + Inspector)
│   ├── components/
│   │   ├── Studio/
│   │   │   ├── PresetDrawer.tsx     # Left Sidebar: Motion templates gallery
│   │   │   ├── CanvasStage.tsx      # Center: Remotion Player with safe zones
│   │   │   ├── MotionInspector.tsx  # Right Sidebar: Springs, fonts, borders, paddings
│   │   │   └── SceneBlockDeck.tsx   # Bottom: Scene block arranger & duration trimmer
│   │   └── Controls/
│   │       ├── CustomSelect.tsx     # Normalized dark-mode dropdowns
│   │       ├── ColorSwatch.tsx      # Clean swatch + hex input
│   │       └── SliderControl.tsx    # Sleek spring/opacity sliders
│   ├── remotion/
│   │   ├── Root.tsx                # Composition registry (16:9 & 9:16)
│   │   ├── Composition.tsx         # Scene sequencer
│   │   ├── core/
│   │   │   ├── MotionLayer.tsx     # Universal spring & stagger motion wrapper
│   │   │   └── BentoCard.tsx       # Floating UI card component
│   │   └── scenes/
│   │       ├── CenterImpactScene.tsx
│   │       ├── BentoDeviceScene.tsx
│   │       ├── CascadeScene.tsx
│   │       └── HighlighterScene.tsx
│   ├── store/
│   │   └── useStudioStore.ts       # Zustand store for scenes, clips, and inspector state
│   └── lib/
│       ├── khmerSegmentation.ts    # Intl.Segmenter phrase & word pipeline
│       ├── pacingEngine.ts         # Pacing calculation & punctuation pauses
│       └── stickerPresets.ts       # Domain keyword heuristics
├── tailwind.config.ts
├── package.json
└── README.md
```
