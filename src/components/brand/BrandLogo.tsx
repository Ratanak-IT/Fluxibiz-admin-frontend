import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGOS = {
  mark: {
    src: "/brand/fluxibiz-mark.png",
    width: 831,
    height: 900,
  },
  wordmark: {
    src: "/brand/fluxibiz-wordmark.png",
    width: 1400,
    height: 326,
  },
  darkmode: {
    src: "/brand/fluxibiz-dark-mode.png",
    width: 1400,
    height: 326,
  },
  stacked: {
    src: "/brand/fluxibiz-stacked.png",
    width: 908,
    height: 910,
  },
} as const;

export type BrandLogoVariant = keyof typeof LOGOS;

// Maps a variant to its dark-mode counterpart, if one exists.
const DARK_VARIANT: Partial<Record<BrandLogoVariant, BrandLogoVariant>> = {
  wordmark: "darkmode",
};

export default function BrandLogo({
  variant = "wordmark",
  alt = "FluxiBiz",
  className,
  preload = false,
}: {
  variant?: BrandLogoVariant;
  alt?: string;
  className?: string;
  preload?: boolean;
}) {
  const logo = LOGOS[variant];
  const darkVariant = DARK_VARIANT[variant];
  const darkLogo = darkVariant ? LOGOS[darkVariant] : null;


  if (!darkLogo) {
    return (
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={alt}
        priority={preload}
        className={cn("block h-auto object-contain", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={alt}
        priority={preload}
        className={cn("block h-auto object-contain dark:hidden", className)}
      />
      {/* <Image
        src={darkLogo.src}
        width={darkLogo.width}
        height={darkLogo.height}
        alt={alt}
        priority={preload}
        className={cn("hidden h-auto object-contain dark:block", className)}
      /> */}
    </>
  );
}