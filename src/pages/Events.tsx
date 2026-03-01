import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, ArrowRight, Database } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";

const fetchEventos = async () => {
  const { data, error } = await supabase.from("eventos").select("*");
  if (error) {
    console.error("Erro ao buscar eventos:", error);
    return [];
  }
  return data || [];
};


const getFormatDate = (date: Date) => {
  const day = date.getUTCDate();
  const month = date.toLocaleString("pt-BR", { month: "long" });
  const dayFormatted = day < 10 ? `0${day}` : day;
  return  {
    day: dayFormatted as string,
    month: month as string,
  }
};

const formatDateEvent = (evento: any) => {
  const startDate = new Date(evento.data_inicio);
  const endDate = new Date(evento.data_fim);

  const startDateFormatted = getFormatDate(startDate);
  const endDateFormatted = getFormatDate(endDate);

  const dayBetween = new Date(startDate.getTime() + 86400000); // +1 dia (24h em ms)
  const dayBetweenFormatted = getFormatDate(dayBetween);
  
  return `${startDateFormatted.day}, ${dayBetweenFormatted.day} e ${endDateFormatted.day} de ${startDateFormatted.month}`;
}

// ===============================================================================
// REMOVE SOON
// This is a temporary function to add a specific route for the OIKOS 2026 event.
// ===============================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addRoteForOIKOS = (eventos: any[]) => {
  return eventos.map((evento) => {
    if (evento.nome === "OIKOS 2026") {
      return { ...evento, rota: "/eventos/oikos-2026" };
    }
    return { ...evento, rota: `/eventos/${evento.id}` };
  });
};

const Events = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const loadEventos = async () => {
      setLoading(true);
      const eventosData = await fetchEventos();
      const eventosWithRota = addRoteForOIKOS(eventosData);
      setEventos(eventosWithRota);
      setLoading(false);
    };
    loadEventos();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4 text-center md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                Nossos Eventos
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Escolha um evento e faça sua inscrição. Venha viver uma
                experiência transformadora!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Events List */}
        {loading ? (
          <section className="py-12">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="mb-8 font-display text-2xl font-bold text-foreground">
                Carregando eventos...
              </h2>
            </div>
          </section>
        ) : (
          <section className="py-12">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="mb-8 font-display text-2xl font-bold text-foreground">
                Próximos Eventos
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {eventos.map((evento, index) => (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className="h-full cursor-pointer border-border/50 shadow-card transition-all hover:shadow-soft hover:border-primary/30 group"
                      onClick={() => navigate(evento.rota)}
                    >
                      <CardHeader>
                        <CardTitle className="font-display text-xl text-foreground flex items-center justify-between">
                          {evento.nome}
                          <ArrowRight className="h-5 w-5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                        </CardTitle>
                        <CardDescription>{evento.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          {formatDateEvent(evento)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {evento.local}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
