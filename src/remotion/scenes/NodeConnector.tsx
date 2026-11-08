import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { StickerBadge } from "@/components/Video/StickerBadge";
import { SceneBackground } from "@/remotion/backgrounds/SceneBackground";
import { battambangFontFamily, poppinsFontFamily } from "../fonts";
import type { SceneProps } from "./types";
import { isColorDark } from "@/lib/colorUtils";
import { ApiIcon, DatabaseIcon, ServerIcon, CodeIcon } from "@/components/Video/icons";

export function NodeConnector({
  text,
  stickers,
  background,
  backgroundColor,
  textColor,
  lineHeight = 1.35,
  fontSize = 72,
  positionX = 0,
  positionY = 0,
  textAlign = "center",
  nodes,
}: SceneProps) {
  const [nodeLabel1, nodeLabel2, nodeLabel3] = nodes ?? ["Client App", "REST API", "Database"];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const effectiveBg = backgroundColor === "transparent" ? "transparent" : (backgroundColor ?? "#000000");
  const isDark = isColorDark(effectiveBg === "transparent" ? "#000000" : effectiveBg);
  const effectiveText = textColor ?? (isDark ? "#FFFFFF" : "#000000");
  const accentColor = "#F1591F";

  // Animated line drawing progress (0 to 1)
  const lineProgress = interpolate(frame, [5, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated moving data packet traveling along line (0 to 100%)
  const packetProgress = (frame * 1.8) % 100;

  // Spring scale entrance for nodes
  const nodeEntrance1 = spring({ frame: frame - 2, fps, config: { damping: 12, mass: 0.5 } });
  const nodeEntrance2 = spring({ frame: frame - 12, fps, config: { damping: 12, mass: 0.5 } });
  const nodeEntrance3 = spring({ frame: frame - 22, fps, config: { damping: 12, mass: 0.5 } });

  // Text entrance
  const textOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textTranslateY = interpolate(frame, [15, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodeBorderCol = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  const nodeBgCol = isDark ? "rgba(23, 23, 26, 0.9)" : "rgba(255, 255, 255, 0.9)";
  const lineColor = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.25)";

  return (
    <AbsoluteFill style={{ backgroundColor: effectiveBg }}>
      {background?.style && background.style !== "none" && (
        <SceneBackground {...background} isDark={isDark} />
      )}

      {/* Floating Animated Sticker Badges */}
      {stickers.map((sticker, i) => (
        <StickerBadge key={sticker.category} sticker={sticker} index={i} />
      ))}

      {/* Main Content Area */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 100,
          transform: `translate(${positionX}px, ${positionY}px)`,
        }}
      >
        {/* TOP: Animated Point-to-Point Architecture Node Flow */}
        <div
          style={{
            position: "relative",
            width: "820px",
            height: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "50px",
          }}
        >
          {/* Animated Connecting SVG Lines */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            {/* Base line from Node 1 to Node 2 */}
            <line
              x1="120"
              y1="60"
              x2="410"
              y2="60"
              stroke={lineColor}
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {/* Active Drawing Line 1 */}
            <line
              x1="120"
              y1="60"
              x2={120 + 290 * lineProgress}
              y2="60"
              stroke={accentColor}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Base line from Node 2 to Node 3 */}
            <line
              x1="410"
              y1="60"
              x2="700"
              y2="60"
              stroke={lineColor}
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {/* Active Drawing Line 2 */}
            <line
              x1="410"
              y1="60"
              x2={410 + 290 * Math.max(0, (lineProgress - 0.4) / 0.6)}
              y2="60"
              stroke={accentColor}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Travelling Data Packet Dot 1 */}
            <circle
              cx={120 + 290 * (packetProgress / 100)}
              cy="60"
              r="6"
              fill={accentColor}
              filter="drop-shadow(0 0 8px #F1591F)"
            />
            {/* Travelling Data Packet Dot 2 */}
            <circle
              cx={410 + 290 * (packetProgress / 100)}
              cy="60"
              r="6"
              fill="#38BDF8"
              filter="drop-shadow(0 0 8px #38BDF8)"
            />
          </svg>

          {/* Node 1: Client / Request */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transform: `scale(${nodeEntrance1})`,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: nodeBgCol,
                border: `3px solid ${nodeBorderCol}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <CodeIcon size={32} color={effectiveText} strokeWidth={2.2} />
            </div>
            <span
              style={{
                fontFamily: poppinsFontFamily,
                fontWeight: 600,
                fontSize: 15,
                color: effectiveText,
                letterSpacing: "0.5px",
                maxWidth: 130,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {nodeLabel1}
            </span>
          </div>

          {/* Node 2: API Gateway (Center) */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transform: `scale(${nodeEntrance2})`,
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: "20px",
                backgroundColor: nodeBgCol,
                border: `3px solid ${accentColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 25px rgba(241, 89, 31, 0.35)`,
              }}
            >
              <ApiIcon size={38} color={accentColor} strokeWidth={2.4} />
            </div>
            <span
              style={{
                fontFamily: poppinsFontFamily,
                fontWeight: 700,
                fontSize: 16,
                color: accentColor,
                letterSpacing: "0.5px",
                maxWidth: 150,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {nodeLabel2}
            </span>
          </div>

          {/* Node 3: Server / Database */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transform: `scale(${nodeEntrance3})`,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                backgroundColor: nodeBgCol,
                border: `3px solid ${nodeBorderCol}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <DatabaseIcon size={32} color={effectiveText} strokeWidth={2.2} />
            </div>
            <span
              style={{
                fontFamily: poppinsFontFamily,
                fontWeight: 600,
                fontSize: 15,
                color: effectiveText,
                letterSpacing: "0.5px",
                maxWidth: 130,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {nodeLabel3}
            </span>
          </div>
        </div>

        {/* BOTTOM: Kinetic Narration Text */}
        <div
          style={{
            fontFamily: `${poppinsFontFamily}, ${battambangFontFamily}, sans-serif`,
            fontWeight: 700,
            fontSize,
            color: effectiveText,
            textAlign,
            lineHeight,
            maxWidth: "92%",
            wordBreak: "break-word",
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
