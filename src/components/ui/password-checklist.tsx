import { Check, X } from "lucide-react";

interface Rule {
  label: string;
  test: (v: string) => boolean;
}

const DEFAULT_RULES: Rule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  { label: "One symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

interface PasswordChecklistProps {
  value: string;
  rules?: Rule[];
  className?: string;
}

export function PasswordChecklist({
  value,
  rules = DEFAULT_RULES,
  className = "",
}: PasswordChecklistProps) {
  return (
    <ul className={`space-y-1 text-xs ${className}`} aria-label="Password requirements">
      {rules.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 ${
              ok ? "text-success" : "text-muted-foreground"
            }`}
          >
            {ok ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
