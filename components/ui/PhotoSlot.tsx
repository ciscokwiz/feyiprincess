import Image from "next/image";
import type { CSSProperties } from "react";
import { publicFileExists } from "@/lib/publicAssets";
import type { PhotoAsset } from "@/lib/types";

interface PhotoSlotProps {
  photo: PhotoAsset;
  shape?: "rounded" | "blob" | "arch";
  /** Placeholder background, e.g. "var(--c-marigold-tint)". */
  tint?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Reserved space for a real photo. The aspect ratio is fixed from the photo's
 * width/height, so dropping the file into /public/images causes no layout shift.
 * Until the file exists, an on-brand placeholder shows the label and expected path.
 */
export function PhotoSlot({ photo, shape = "rounded", tint, priority = false, sizes = "(max-width: 860px) 100vw, 50vw", className = "" }: PhotoSlotProps) {
  const hasImage = publicFileExists(photo.src);
  const style: CSSProperties & Record<"--slot-tint", string | undefined> = {
    aspectRatio: `${photo.width} / ${photo.height}`,
    "--slot-tint": tint,
  };

  return (
    <div className={`photo-slot photo-slot--${shape} ${className}`} style={style}>
      {hasImage ? (
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} />
      ) : (
        <div className="photo-slot__placeholder" role="img" aria-label={`Photo coming soon: ${photo.alt}`}>
          <svg className="photo-slot__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <span className="photo-slot__label">{photo.label}</span>
          <span className="photo-slot__hint">Photo coming soon</span>
        </div>
      )}
    </div>
  );
}
