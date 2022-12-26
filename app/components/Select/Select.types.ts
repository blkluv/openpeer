export interface Option {
  id: number;
  name: string;
  icon: string;
}

export interface SelectProps {
  label: string;
  options: Option[];
  selected: Option | undefined;
  onSelect: (option: Option | undefined) => void;
}
