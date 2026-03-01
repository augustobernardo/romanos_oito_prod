import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSection } from "./FormHelpers";
import modelagemCamisa from "@/assets/modelagem-camisa.png";
import type { FormData } from "./types";

interface Props {
  form: UseFormReturn<FormData>;
}

const CamisaSection = ({ form }: Props) => (
  <FormSection title="MODELAGEM DA CAMISA - Confira as medidas antes de solicitar a sua camisa!">
    <div className="rounded-lg overflow-hidden border border-border">
      <img
        src={modelagemCamisa}
        alt="Tabela de medidas da camisa com tamanhos PP, P, M, G, GG e XG"
        className="w-full h-auto"
      />
    </div>

    <FormField
      control={form.control}
      name="tamanhoCamisa"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tamanho da Camisa: *</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-4"
            >
              {["PP", "P", "M", "G", "GG", "XG"].map((size) => (
                <FormItem key={size} className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={size} />
                  </FormControl>
                  <FormLabel className="font-normal">{size}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="cienteTrocaCamisa"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-muted/30">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm leading-relaxed cursor-pointer">
              Está ciente que para efetuar a troca do tamanho da sua camisa precisará entrar em
              contato com o SAC solicitando a troca e caso já tenha sido feito o pedido das camisas
              verificar a disponibilidade em estoque? *
            </FormLabel>
            <p className="text-xs text-muted-foreground font-medium mt-1">Sim! Estou ciente.</p>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  </FormSection>
);

export default CamisaSection;
