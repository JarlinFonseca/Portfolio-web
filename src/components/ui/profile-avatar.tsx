import { cn } from '@/utils/cn';

/** Foto circular con sombra sólida; sin foto muestra la silueta por defecto. */
export function ProfileAvatar({
  photoUrl,
  alt,
  size = 76,
  className,
}: {
  photoUrl: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'shrink-0 overflow-hidden rounded-full',
        // la sombra sólida desplazada solo encaja con la silueta; sobre una foto se ve como un círculo negro detrás
        photoUrl
          ? 'bg-surface shadow-[0_0_0_3px_var(--color-surface),0_0_0_4px_rgb(20_22_26/12%),0_8px_20px_-8px_rgb(20_22_26/40%)]'
          : 'border-[1.5px] border-ink bg-[#dce4fc] shadow-offset',
        className,
      )}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={alt}
          width={size}
          height={size}
          decoding="async"
          className="block size-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 76 76" width={size} height={size} role="img" aria-label={alt} className="block">
          <circle cx="38" cy="30" r="13" fill="#2D5BE3" />
          <path d="M12 76c2-17 13-26 26-26s24 9 26 26z" fill="#2D5BE3" />
        </svg>
      )}
    </div>
  );
}
