import Image from "next/image";
import { brandName } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Brand() {
  return (
    <Image
      className="albar-brand"
      src="/images/albar-logo-hd.webp"
      alt={brandName}
      width={2133}
      height={451}
      unoptimized
    />
  );
}

/** Code-native brand illustration, usable at any size without bitmap assets. */
export function LegalIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 340"
      fill="none"
      className={cn("legal-illustration", className)}
      role="img"
      aria-label="Ilustración arquitectónica de un arco y una balanza"
    >
      <defs>
        <pattern
          id="legal-grain"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".55" fill="currentColor" opacity=".09" />
        </pattern>
      </defs>
      <rect width="340" height="340" rx="4" fill="hsl(var(--brand-sand))" />
      <rect width="340" height="340" fill="url(#legal-grain)" />
      <path
        d="M75 290V140a95 95 0 0 1 190 0v150"
        fill="hsl(var(--brand-pine))"
      />
      <path
        d="M96 290V143a74 74 0 0 1 148 0v147"
        stroke="hsl(var(--brand-sage))"
        strokeOpacity=".25"
      />
      <path
        d="M170 105v148m-48 0h96m-90-107 42-20 42 20m-84 0-23 61h46l-23-61Zm84 0-23 61h46l-23-61Z"
        stroke="hsl(var(--brand-sand))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M105 207c0 10 10 16 23 16s23-6 23-16m38 0c0 10 10 16 23 16s23-6 23-16"
        stroke="hsl(var(--brand-sand))"
        strokeWidth="2"
      />
      <path
        d="M49 290h242M38 302h264M25 314h290"
        stroke="hsl(var(--brand-pine))"
        strokeWidth="1.5"
      />
      <circle cx="278" cy="65" r="27" fill="hsl(var(--brand-terracotta))" />
      <path
        d="M43 45h35m-17-17v35M286 245h20m-10-10v20"
        stroke="hsl(var(--brand-pine))"
        strokeOpacity=".35"
      />
    </svg>
  );
}
