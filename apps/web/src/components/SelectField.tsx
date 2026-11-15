import { RefusalMessage } from "./RefusalMessage";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  /** Shown as the first, empty choice when given. */
  placeholder?: string;
  testId: string;
}

/** select-field: a native select with the same label and error layout as input-field. */
export function SelectField(props: SelectFieldProps) {
  const errorId = props.error ? `${props.id}-error` : undefined;
  return (
    <div className="field">
      <label htmlFor={props.id}>{props.label}</label>
      <div className="field__control">
        <select
          id={props.id}
          name={props.id}
          value={props.value}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={errorId}
          data-testid={props.testId}
          onChange={(event) => props.onChange(event.target.value)}
        >
          {props.placeholder !== undefined ? (
            <option value="">{props.placeholder}</option>
          ) : null}
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {props.error ? (
        <RefusalMessage id={errorId} message={props.error} />
      ) : null}
    </div>
  );
}
