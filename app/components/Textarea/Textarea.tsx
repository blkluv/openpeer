interface TextareaProps {
  label: string
  rows: string
  name: string
  id: string
  placeholder: string
}

const Textarea = ({ label, rows, name, id, placeholder }: TextareaProps) => {
  return (
    <div>
      <label htmlFor="comment" className="block text-base font-bold text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <textarea
          rows={rows}
          name={name}
          id={id}
          placeholder={placeholder}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          defaultValue={""}
        />
      </div>
    </div>
  )
}

export default Textarea