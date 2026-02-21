export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,.45)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "success" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,.25)]",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,.18)]",
    danger:
      "bg-rose-600 text-white hover:bg-rose-500 shadow-[0_10px_30px_rgba(244,63,94,.18)]",
    ghost: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none",
        "placeholder:text-white/30 focus:border-white/20 focus:bg-white/7",
        props.className,
      )}
    />
  );
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "blue" | "green" | "yellow" | "pink";
}) {
  const tones = {
    neutral: "bg-white/10 text-white/85 border-white/10",
    blue: "bg-blue-500/15 text-blue-200 border-blue-500/20",
    green: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    yellow: "bg-amber-500/15 text-amber-200 border-amber-500/20",
    pink: "bg-pink-500/15 text-pink-200 border-pink-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-white/60">{subtitle}</p>
      ) : null}
    </div>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
