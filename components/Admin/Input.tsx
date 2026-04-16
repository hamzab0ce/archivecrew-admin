export default function Input({ type, name, label, optional, placeholder }: {
  type: string
  name: string
  label: string
  optional?: boolean
  placeholder?: string
 }) {
  return (
    <label htmlFor={name} className="flex flex-col gap-2">
      <span>{label}: {optional && "(Opcional)" } </span>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        className="border text-zinc-400 rounded py-1 px-2 border-zinc-800"
        type={type}
      />
    </label>
  );
}