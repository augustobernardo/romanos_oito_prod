import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInputField, FormSection } from "./FormHelpers";
import type { FormData } from "./types";

interface Props {
  form: UseFormReturn<FormData>;
}

const EmergenciaSection = ({ form }: Props) => (
  <FormSection title="Contato de Emergência">
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
      <p className="font-bold text-destructive text-sm">LEIA COM ATENÇÃO:</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Em caso de emergência ou para contatos adversos com algum familiar próximo ligar para:
        (Identifique abaixo para quem ligar - Mãe, Pai, Avó, Cônjuge ou Responsável Legal...
        Colocar nome, grau de parentesco da pessoa e contato!) - Preferência número de WhatsApp.
        Pedimos também que seja avisada a tal pessoa que estará colocando o nome e o número dela
        para caso de emergência para ela estar ciente disto.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <FormField
        control={form.control}
        name="nomePessoaEmergencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome: *</FormLabel>
            <FormControl>
              <Input placeholder="Nome da pessoa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="grauParentescoEmergencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grau de Parentesco: *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Mãe, Pai, Tio..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <PhoneInputField form={form} name="numeroEmergencia" label="Número: *" />
    </div>
  </FormSection>
);

export default EmergenciaSection;
