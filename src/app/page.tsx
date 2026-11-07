import { WorkspaceLoader } from "@/components/WorkspaceLoader";

// Khmer word segmentation (Intl.Segmenter) can disagree between Node's SSR
// pass and the browser's engine, since Khmer has no spaces and relies on
// dictionary-based word-break heuristics that differ by ICU implementation.
// This workspace is purely interactive with no SEO need, so it's rendered
// client-only (via WorkspaceLoader's ssr:false dynamic import) to avoid any
// resulting hydration mismatch.
export default function Home() {
  return <WorkspaceLoader />;
}
