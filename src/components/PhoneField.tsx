import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./phone-field.css";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const PhoneField = ({ value, onChange, placeholder, className }: PhoneFieldProps) => {
  return (
    <PhoneInput
      international
      defaultCountry="EG"
      value={value || undefined}
      onChange={(v) => onChange(v || "")}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default PhoneField;