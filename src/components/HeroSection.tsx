import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Romanos <span className="text-primary">Oito</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              "Tenho para mim que os sofrimentos da presente vida não têm proporção alguma com a glória futura que nos deve ser manifestada.
              Por isso, a criação aguarda ansiosamente a manifestação dos filhos de Deus."
            </p>
            <p className="mt-2 text-sm font-medium text-primary">— Romanos 8, 15-19</p>
            
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="shadow-soft">
                <Link to="/eventos">Eventos</Link>
              </Button>
              {/* <Button variant="outline" size="lg" asChild>
                <a href="#quem-somos">Saiba Mais</a>
              </Button> */}
            </div>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* <div className="relative aspect-video overflow-hidden rounded-2xl bg-card shadow-card"> */}
              {/* Video Placeholder */}
              {/* <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg transition-transform hover:scale-110">
                    <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Assista nosso vídeo
                  </p>
                </div>
              </div> */}
              
              {/* If you have a real video, replace the above with an iframe */}
              {/* 
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/VIDEO_ID"
                title="Romanos Oito"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              */}
            {/* </div> */}

            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
