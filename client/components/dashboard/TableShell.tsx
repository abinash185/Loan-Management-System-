interface Props {
  loading: boolean;
  error: string;
  isEmpty: boolean;
  emptyText: string;
  onRetry: () => void;
  children: React.ReactNode;
}

export function TableShell({ loading, error, isEmpty, emptyText, onRetry, children }: Props) {
  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}{" "}
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      </div>
    );
  }
  if (loading && isEmpty) return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;
  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
        {emptyText}
      </div>
    );
  }
  return (
    <div
      className={`overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-opacity ${
        loading ? "opacity-60" : ""
      }`}
    >
      {children}
    </div>
  );
}