import type { Json } from "../os/store/types.js";

/**
 * The approved DesignSpec becomes tokens.css: the constitution the
 * builder lives under. Spec JSON and CSS are written together and
 * must never drift.
 */
export function tokensCssFromSpec(spec: Json): string {
  const tokens = (spec.tokens ?? {}) as {
    grounds?: Array<{ name: string; value: string; on: string }>;
    accent?: { name: string; value: string; rule: string };
    neutrals?: Array<{ name: string; value: string; role: string }>;
  };
  const type = (spec.type_system ?? {}) as { display_font?: string; text_font?: string };
  const motion = (spec.motion ?? {}) as { easing?: string; duration_range?: string };
  const brand = (spec.brand ?? {}) as { name?: string };

  const g0 = tokens.grounds?.[0];
  const g1 = tokens.grounds?.[1];
  const n = tokens.neutrals ?? [];
  const durations = (motion.duration_range ?? "0.4s to 0.8s").match(/[\d.]+s/g) ?? ["0.4s", "0.8s"];

  const lines: string[] = [
    `/* ${brand.name ?? "Client"} design tokens.`,
    `   Generated from the approved design spec. The builder may not`,
    `   invent values outside this file. */`,
    ":root {",
    `  /* ground: ${g0?.name ?? "ground"} */`,
    `  --ground: ${g0?.value ?? "#faf8f4"};`,
    `  --on-ground: ${g0?.on ?? "#23201b"};`,
  ];
  if (g1) {
    lines.push(`  /* alt ground: ${g1.name}; flipping mid-page is a chapter break */`);
    lines.push(`  --ground-alt: ${g1.value};`);
    lines.push(`  --on-ground-alt: ${g1.on};`);
  }
  lines.push(
    `  --raised: color-mix(in srgb, ${g0?.value ?? "#faf8f4"} 88%, white);`,
    `  /* accent (${tokens.accent?.name ?? "accent"}): ${tokens.accent?.rule ?? "punctuation only"} */`,
    `  --accent: ${tokens.accent?.value ?? "#8a6d3f"};`,
  );
  const dim = n[0];
  const faint = n[1];
  lines.push(
    `  /* ${dim?.role ?? "secondary text"} */`,
    `  --text-dim: ${dim?.value ?? "#6d675e"};`,
    `  /* ${faint?.role ?? "captions"} */`,
    `  --text-faint: ${faint?.value ?? "#98917f"};`,
    `  --line: color-mix(in srgb, ${g0?.on ?? "#23201b"} 14%, transparent);`,
    "",
    `  --font-display: "${type.display_font ?? "Georgia"}";`,
    `  --font-text: "${type.text_font ?? "system-ui"}";`,
    "",
    `  /* motion: one family, one range */`,
    `  --ease: ${motion.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)"};`,
    `  --dur-reveal: ${durations[durations.length - 1] ?? "0.8s"};`,
    `  --dur-feedback: 0.2s;`,
    "}",
    "",
  );
  return lines.join("\n");
}
