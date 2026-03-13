import headlinePeople from "@/assets/oikos/headline-people.png";

const HeadlineSection = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <img
        src={headlinePeople}
        alt="Casa, Lugar, Habitado, Família - Participantes do OIKOS sorrindo"
        className="w-full h-auto block max-w-full"
        loading="eager"
      />
    </section>
  );
};

export default HeadlineSection;
