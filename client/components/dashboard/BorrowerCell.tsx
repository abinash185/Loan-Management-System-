export function BorrowerCell({ name, email }: { name: string; email: string }) {
  return (
    <div>
      <p className="font-medium text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{email}</p>
    </div>
  );
}
