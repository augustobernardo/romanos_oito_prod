const WelcomeSection = () => {
  return (
    <section className="w-full" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Left text */}
          <div>
            <h2
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase leading-[0.85]"
              style={{ color: "#14A7C9" }}
            >
              SEJA
              <br />
              BEM-
              <br />
              VINDO
              <br />
              AO
            </h2>
          </div>

          {/* Center - decorative element */}
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-56 md:w-48 md:h-64">
              {/* Monstrance SVG placeholder */}
              <svg
                viewBox="0 0 120 170"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full opacity-60"
              >
                {/* Rays */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  const x1 = 60 + Math.cos(angle) * 25;
                  const y1 = 60 + Math.sin(angle) * 25;
                  const x2 = 60 + Math.cos(angle) * 55;
                  const y2 = 60 + Math.sin(angle) * 55;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#14A7C9"
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  );
                })}
                {/* Center circle */}
                <circle cx="60" cy="60" r="20" stroke="#14A7C9" strokeWidth="2" fill="none" />
                <circle cx="60" cy="60" r="12" stroke="#14A7C9" strokeWidth="1.5" fill="none" />
                {/* Stand */}
                <line x1="60" y1="80" x2="60" y2="140" stroke="#14A7C9" strokeWidth="2" />
                <ellipse cx="60" cy="145" rx="20" ry="6" stroke="#14A7C9" strokeWidth="1.5" fill="none" />
                <ellipse cx="60" cy="155" rx="28" ry="8" stroke="#14A7C9" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
          </div>

          {/* Right text */}
          <div className="md:text-right">
            <h2
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase leading-[0.85]"
              style={{ color: "#fff" }}
            >
              MELHOR
              <br />
              FIM DE
              <br />
              SEMANA
              <br />
              DA SUA
              <br />
              VIDA
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
