import { loadFont as loadMoul } from "@remotion/google-fonts/Moul";
import { loadFont as loadBattambang } from "@remotion/google-fonts/Battambang";
import { loadFont as loadKantumruyPro } from "@remotion/google-fonts/KantumruyPro";

// Restricted to the "khmer" subset only: this app never renders Latin text,
// and loading extra subsets/weights multiplies font fetches enough to risk
// a delayRender() timeout during render (see Remotion's font-loading docs).
export const { fontFamily: moulFontFamily } = loadMoul("normal", {
  subsets: ["khmer"],
});
export const { fontFamily: battambangFontFamily } = loadBattambang("normal", {
  weights: ["700"],
  subsets: ["khmer"],
});
export const { fontFamily: kantumruyProFontFamily } = loadKantumruyPro("normal", {
  weights: ["600", "700"],
  subsets: ["khmer"],
});
