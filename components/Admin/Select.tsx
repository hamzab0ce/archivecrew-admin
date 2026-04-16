import { ChevronDown } from "lucide-react";
import { useState } from "react";
import CheckBoxCustomized from "../Home/Filters/CheckBoxCustomized";

export default function Select({ name, options, handleChange, selectedOption }: {
  name: string
  options: string[],
  handleChange: (option: string) => void,
  selectedOption: string[]
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptionsList = selectedOption.map((option) => (
    <li
      key={option}
      className="flex items-center border border-zinc-800 px-2 rounded-lg gap-2 text-zinc-300"
    >
      {option}
    </li>
  ))

  const optionsList = options.map((option) => (
    <label
      key={option}
      className="flex items-center group text-zinc-300 p-2 gap-2 h-10"
    >
      <CheckBoxCustomized value={option} onChange={() => handleChange(option)} name={name.toLowerCase()} isActive={selectedOption.includes(option)}  />
      {option}
    </label>
  ));

  return (
    <div className="relative z-20 group">
      <h2 className="mb-2">{name}</h2>
      <label>
        <div className="border cursor-pointer border-zinc-800 rounded flex justify-between flex-wrap items-center gap-2 p-1">
          <ul className="flex text-zinc-300 flex-wrap gap-2 max-w-72 flex-1">
            {selectedOptionsList}
          </ul>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            <ChevronDown
              className={`duration-300 ${isOpen ? "rotate-180" : ""}`}
              size={20}
            />
          </button>
        </div>
      </label>
      <div
        className={`absolute px-2 flex-col overflow-hidden hover:overflow-y-scroll max-h-52 my-2 rounded-lg backdrop-blur-2xl w-full ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {optionsList}
      </div>
    </div>
  );
}