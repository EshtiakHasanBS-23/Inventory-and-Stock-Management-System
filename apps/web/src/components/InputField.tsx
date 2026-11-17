import type { InputHTMLAttributes, ReactNode } from "react";
import { RefusalMessage } from "./RefusalMessage";

export interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
  type?: "text" | "tel" | "password" | "date";
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  testId: string;
  /** Extra control beside the input, such as the password Show/Hide button. */
  addon?: ReactNode;
  /** Spans two columns in a form grid (for long values such as names). */
  wide?: boolean;
}

/**
 * input-field: label above, the box, then the hint and any error below it,
 * both linked with aria-describedby; aria-invalid on error. Hints sit below
 * the box so boxes in the same form row always line up.
 */
export function InputField(props: InputFieldProps) {
  const hintId = props.hint ? `${props.id}-hint` : undefined;
  const errorId = props.error ? `${props.id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={props.wide ? "field field--wide" : "field"}>
      <label htmlFor={props.id}>{props.label}</label>
      <div className="field__control">
        <input
          id={props.id}
          name={props.id}
          type={props.type ?? "text"}
          value={props.value}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          data-testid={props.testId}
          onChange={(event) => props.onChange(event.target.value)}
          onBlur={props.onBlur}
        />
        {props.addon}
      </div>
      {props.hint ? (
        <p className="field__hint" id={hintId}>
          {props.hint}
        </p>
      ) : null}
      {props.error ? (
        <RefusalMessage id={errorId} message={props.error} />
      ) : null}
    </div>
  );
}
