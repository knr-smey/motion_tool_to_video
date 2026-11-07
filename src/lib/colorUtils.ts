export function isColorDark(hexColor?: string): boolean {
  if (!hexColor) return true;
  const hex = hexColor.replace("#", "").trim();
  let r = 255;
  let g = 255;
  let b = 255;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return true;
  }

  // Perceived brightness formula (YIQ)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
