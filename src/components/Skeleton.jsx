export default function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-white/10 ${className}`}
    />
  );
}

