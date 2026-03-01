import { motion } from "framer-motion";
import { Heart, Users, Flame, Church, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const aboutCards = [
  {
    icon: Heart,
    title: "Nossa Missão",
    description:
      "Levar o amor de Cristo aos jovens, promovendo encontros transformadores que renovam a fé e fortalecem a comunhão com Deus e com o próximo.",
  },
  {
    icon: Calendar,
    title: "AGENDA",
    description:
      "Leve o Romanos Oito até o seu retiro e evento.",
  },
  // {
  //   icon: Flame,
  //   title: "OIKOS",
  //   description:
  //     "Nosso retiro espiritual principal, onde jovens são convidados a viver uma experiência profunda de oração, reflexão e renovação espiritual.",
  // },
  // {
  //   icon: Users,
  //   title: "Conferência",
  //   description:
  //     "Eventos maiores que reúnem jovens de diversas comunidades para momentos de louvor, formação e celebração da fé católica.",
  // },
  // {
  //   icon: Church,
  //   title: "Comunidade",
  //   description:
  //     "Somos uma família de jovens unidos pela fé, comprometidos em viver o Evangelho e construir uma Igreja mais viva e acolhedora.",
  // },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const AboutSection = () => {
  return (
    <section className="py-16 md:py-24" id="quem-somos">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Quem Somos<span className="text-primary">?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Somos um movimento católico de jovens apaixonados por Cristo, 
            comprometidos em viver e anunciar o amor de Deus.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto"
        >
          {aboutCards.map((card, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group h-full border-border/50 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl text-foreground">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
