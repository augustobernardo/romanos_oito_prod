import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatPhone } from "@/utils/phoneUtils";
import type { FormData } from "./types";

// Reusable phone input
type PhoneFieldName = "telefone" | "numeroMae" | "numeroPai" | "numeroResponsavelProximo" | "numeroEmergencia";

interface PhoneInputFieldProps {
  form: UseFormReturn<FormData>;
  name: PhoneFieldName;
  label: string;
  placeholder?: string;
}

export const PhoneInputField = ({ form, name, label, placeholder = "(00) 00000-0000" }: PhoneInputFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            placeholder={placeholder}
            value={field.value as string}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              field.onChange(formatPhone(digits));
            }}
            onBlur={field.onBlur}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

// Radio option group with conditional "Outro"
type StringFieldNames = Exclude<keyof FormData, "cienteTrocaCamisa">;

interface RadioOptionGroupProps {
  form: UseFormReturn<FormData>;
  name: StringFieldNames;
  outroName: StringFieldNames;
  label: string;
  options: { value: string; label: string }[];
  outroValue?: string;
  layout?: string;
}

export const RadioOptionGroup = ({
  form,
  name,
  outroName,
  label,
  options,
  outroValue = "outro",
  layout = "flex flex-wrap gap-4",
}: RadioOptionGroupProps) => (
  <>
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value);
                if (value !== outroValue) {
                  form.setValue(outroName, "");
                }
              }}
              defaultValue={field.value as string}
              className={layout}
            >
              {options.map((opt) => (
                <FormItem key={opt.value} className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={opt.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{opt.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {form.watch(name) === outroValue && (
      <FormField
        control={form.control}
        name={outroName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Especifique:</FormLabel>
            <FormControl>
              <Input placeholder="Digite aqui..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
  </>
);

// Section wrapper
export const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 pt-4">
    <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
    {children}
  </div>
);
