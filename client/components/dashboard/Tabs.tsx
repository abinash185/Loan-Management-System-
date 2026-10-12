interface Props<T extends string> {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}

export function Tabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div className="mb-4 inline-flex rounded-xl bg-slate-200/70 p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            active === t.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}