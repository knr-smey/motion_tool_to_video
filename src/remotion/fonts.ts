import { loadFont as loadMoul } from "@remotion/google-fonts/Moul";
import { loadFont as loadBattambang } from "@remotion/google-fonts/Battambang";
import { loadFont as loadKantumruyPro } from "@remotion/google-fonts/KantumruyPro";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

export const { fontFamily: poppinsFontFamily } = loadPoppins("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

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
