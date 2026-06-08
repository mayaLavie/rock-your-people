type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  descriptionLang?: string;
  descriptionDir?: "rtl" | "ltr";
  descriptionClassName?: string;
  titleClassName?: string;
  align?: "left" | "center";
  inverted?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  descriptionLang,
  descriptionDir,
  descriptionClassName,
  titleClassName,
  align = "center",
  inverted = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const titleClass = inverted
    ? "text-black"
    : "text-cream";
  const descClass = inverted
    ? "text-black/70"
    : "text-cream/80";
  const eyebrowClass = inverted
    ? "text-black/50"
    : "text-cream/60";

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {eyebrow ? (
        <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${eyebrowClass}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-3xl uppercase leading-tight sm:text-4xl lg:text-5xl ${titleClass} ${titleClassName ?? ""}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          lang={descriptionLang}
          dir={descriptionDir}
          className={`mt-4 text-base leading-relaxed sm:text-lg ${descClass} ${descriptionClassName ?? ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
