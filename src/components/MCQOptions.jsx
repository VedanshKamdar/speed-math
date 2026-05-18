export default function MCQOptions({ options, onSelect, disabled }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-6 w-full">
      {options.map((opt, i) => (
        <button key={i}
          onClick={() => !disabled && onSelect(opt)}
          disabled={disabled}
          className="py-5 rounded-2xl bg-brand-800 border-2 border-indigo-900 active:border-indigo-500 font-bold text-xl">
          {opt.answerDisplay}
        </button>
      ))}
    </div>
  )
}
