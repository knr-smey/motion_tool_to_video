interface ImageBackgroundProps {
  src: string;
}

export function ImageBackground({ src }: ImageBackgroundProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "grayscale(1) contrast(1.1)",
      }}
    >
      {/* Kept light so black text stays legible, and grayscale above keeps it monochrome. */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.55)" }} />
    </div>
  );
}
