import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FormData } from "./types";

interface Props {
  form: UseFormReturn<FormData>;
}

const ExpectativaSection = ({ form }: Props) => (
  <FormField
    control={form.control}
    name="expectativaOikos"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Qual sua expectativa para o OIKOS 2026? Nos vemos em breve. Que venha o OIKOS! 🔥
        </FormLabel>
        <FormControl>
          <Textarea placeholder="Conte-nos o que você espera para o retiro..." className="resize-none" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default ExpectativaSection;
