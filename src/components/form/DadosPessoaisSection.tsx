import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInputField, RadioOptionGroup } from "./FormHelpers";
import type { FormData } from "./types";

interface Props {
  form: UseFormReturn<FormData>;
}

const DadosPessoaisSection = ({ form }: Props) => (
  <>
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome Completo: *</FormLabel>
          <FormControl>
            <Input placeholder="Seu nome completo" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="grid gap-4 md:grid-cols-3">
      <FormField
        control={form.control}
        name="dataNascimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento: *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <PhoneInputField form={form} name="telefone" label="Telefone ou WhatsApp: *" />
      <FormField
        control={form.control}
        name="instagram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>@ do Instagram: *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: romanos8.mov" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="comunidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comunidade/Paróquia: *</FormLabel>
            <FormControl>
              <Input placeholder="Nome da sua comunidade ou paróquia" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="cidadeEstado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade e Estado: *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Governador Valadares, Minas Gerais" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <FormField
      control={form.control}
      name="enderecoCompleto"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Endereço Completo: *</FormLabel>
          <FormControl>
            <Input placeholder="Rua, número, bairro..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <RadioOptionGroup
      form={form}
      name="comoConheceu"
      outroName="comoConheceuOutro"
      label="Como conheceu o Romanos Oito? *"
      options={[
        { value: "instagram", label: "Instagram" },
        { value: "amigo", label: "Amigo/Familiar" },
        { value: "paroquia", label: "Paróquia" },
        { value: "outro", label: "Outro" },
      ]}
    />
  </>
);

export default DadosPessoaisSection;
