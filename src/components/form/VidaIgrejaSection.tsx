import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioOptionGroup, FormSection } from "./FormHelpers";
import type { FormData } from "./types";

interface Props {
  form: UseFormReturn<FormData>;
}

const VidaIgrejaSection = ({ form }: Props) => (
  <FormSection title="Vida na Igreja">
    <RadioOptionGroup
      form={form}
      name="isCatolico"
      outroName="isCatolicoOutro"
      label="Você é Católico? *"
      layout="flex flex-col gap-3"
      options={[
        { value: "sim", label: "Sim" },
        { value: "nao", label: 'Não. Participa de alguma religião? (Coloque abaixo na opção "Outro")' },
        { value: "outro", label: "Outro" },
      ]}
    />

    <FormField
      control={form.control}
      name="participaMovimento"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Participa de algum movimento na Igreja (EAC, Grupo de Jovens, GO, RCC, Vicentinos, etc)? *
          </FormLabel>
          <FormControl>
            <Input placeholder="Ex: Grupo de Jovens, RCC..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <RadioOptionGroup
      form={form}
      name="fezRetiro"
      outroName="fezRetiroOutro"
      label="Já participou de algum retiro católico (ou não católico)? Se sim, qual? *"
      outroValue="OUTRO"
      options={[
        { value: "FIJ", label: "FIJ" },
        { value: "SHEKINAH", label: "SHEKINAH" },
        { value: "FIJ E SHEKINAH", label: "FIJ E SHEKINAH" },
        { value: "EAC", label: "EAC" },
        { value: "Não", label: "Não" },
        { value: "OUTRO", label: "Outro" },
      ]}
    />
  </FormSection>
);

export default VidaIgrejaSection;
