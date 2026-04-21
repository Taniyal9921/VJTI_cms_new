import { Link } from "react-router-dom";

export function ContactPage() {
  return (
    <div className="landing-page">
      {/* ── White Header ─────────────────────────────────────── */}
      <header className="landing-header" id="contact-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-logo-link">
            <img
              src="/assets/vjti-logo-wide.png"
              alt="Veermata Jijabai Technological Institute"
              className="landing-logo-img"
            />
          </Link>
          <Link to="/login" className="landing-login-btn" id="contact-login-btn">
            Login
          </Link>
        </div>
      </header>

      {/* ── Red Navigation Bar ───────────────────────────────── */}
      <nav className="landing-nav" id="contact-nav">
        <ul className="landing-nav-list">
          <li>
            <Link to="/" className="landing-nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="landing-nav-link">
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="landing-nav-link landing-nav-link--active">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Contact Hero ──────────────────────────────────────── */}
      <section className="about-hero" id="contact-hero">
        <div className="about-hero-overlay">
          <h1 className="about-hero-title">Contact Us</h1>
          <p className="about-hero-subtitle">
            Get in touch with the administration
          </p>
        </div>
      </section>

      {/* ── Contact Content ───────────────────────────────────── */}
      <section className="py-16 px-8 bg-[#fafafa] flex-1">
        <div className="max-w-4xl mx-auto flex flex-col gap-16">
          
          {/* ── Deans Section ── */}
          <div className="flex flex-col gap-10">
            <div className="text-center mb-4">
              <h2 className="text-[2.2rem] font-extrabold text-[#1a1a2e] inline-block relative pb-3">
                Deans
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#c62828] rounded-full"></span>
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {/* Dr. Sachin D. Kore */}
              <div className="bg-[#fff5f5] rounded-md px-8 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
                <div className="w-[120px] h-[120px] flex-shrink-0 bg-white rounded-full overflow-hidden border border-red-100 flex items-center justify-center shadow-sm">
                   <img src="https://ui-avatars.com/api/?name=Sachin+Kore&background=c62828&color=fff&size=128" alt="Dr. Sachin D. Kore" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-[#1a1a2e] flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-[1.1rem] font-semibold inline-block relative pb-2 mb-4">
                    Dr. Sachin D. Kore
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-12 h-0.5 bg-[#c62828]"></span>
                  </h3>
                  <p className="text-[0.95rem] mb-1 font-medium text-[#1a1a2e]">Director</p>
                  <p className="text-[0.95rem] text-[#333] mb-2">Email: director[at]vjti[dot]ac[dot]in</p>
                  <p className="text-[0.9rem] text-[#555] max-w-xl">To contact regarding overall administration, and all communications should go through the personal assistant (PA).</p>
                </div>
              </div>

              {/* Dr. K.K. Sangle */}
              <div className="bg-[#fff5f5] rounded-md px-8 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
                <div className="w-[120px] h-[120px] flex-shrink-0 bg-white rounded-full overflow-hidden border border-red-100 flex items-center justify-center shadow-sm">
                   <img src="https://ui-avatars.com/api/?name=K+K+Sangle&background=c62828&color=fff&size=128" alt="Dr. K.K. Sangle" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-[#1a1a2e] flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-[1.1rem] font-semibold inline-block relative pb-2 mb-4">
                    Dr. K.K. Sangle
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-12 h-0.5 bg-[#c62828]"></span>
                  </h3>
                  <p className="text-[0.95rem] mb-1 font-medium text-[#1a1a2e]">Registrar</p>
                  <p className="text-[0.95rem] text-[#333]">Email: registrar[at]vjti[dot]ac[dot]in</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── HODs Section ── */}
          <div className="flex flex-col gap-10">
            <div className="text-center mb-4">
              <h2 className="text-[2.2rem] font-extrabold text-[#1a1a2e] inline-block relative pb-3">
                HODs
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#c62828] rounded-full"></span>
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {/* Dr. V.B. Nikam */}
              <div className="bg-[#fff5f5] rounded-md px-8 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
                <div className="w-[120px] h-[120px] flex-shrink-0 bg-white rounded-full overflow-hidden border border-red-100 flex items-center justify-center shadow-sm">
                   <img src="https://ui-avatars.com/api/?name=V+B+Nikam&background=c62828&color=fff&size=128" alt="Dr. V.B. Nikam" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-[#1a1a2e] flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-[1.1rem] font-semibold inline-block relative pb-2 mb-4">
                    Dr. V.B. Nikam
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-12 h-0.5 bg-[#c62828]"></span>
                  </h3>
                  <p className="text-[0.95rem] mb-1 font-medium text-[#1a1a2e]">Department – Computer Engineering & Information Technology</p>
                  <p className="text-[0.95rem] text-[#333]">Email: hod_degree[at]ce[dot]vjti[dot]ac[dot]in</p>
                </div>
              </div>

              {/* Dr. Sujata Parameswaran */}
              <div className="bg-[#fff5f5] rounded-md px-8 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
                <div className="w-[120px] h-[120px] flex-shrink-0 bg-white rounded-full overflow-hidden border border-red-100 flex items-center justify-center shadow-sm">
                   <img src="https://ui-avatars.com/api/?name=Sujata+Parameswaran&background=c62828&color=fff&size=128" alt="Dr. Sujata Parameswaran" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-[#1a1a2e] flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-[1.1rem] font-semibold inline-block relative pb-2 mb-4">
                    Dr. Sujata Parameswaran
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-12 h-0.5 bg-[#c62828]"></span>
                  </h3>
                  <p className="text-[0.95rem] mb-1 font-medium text-[#1a1a2e]">Department – Physics/ Chemistry(I/C)</p>
                  <p className="text-[0.95rem] text-[#333]">Email: hod_physics[at]hs[dot]vjti[dot]ac[dot]in / hod_chemistry[at]hs[dot]vjti[dot]ac[dot]in</p>
                </div>
              </div>

              {/* Dr. K.K. Sangle */}
              <div className="bg-[#fff5f5] rounded-md px-8 py-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
                <div className="w-[120px] h-[120px] flex-shrink-0 bg-white rounded-full overflow-hidden border border-red-100 flex items-center justify-center shadow-sm">
                   <img src="https://ui-avatars.com/api/?name=K+K+Sangle&background=c62828&color=fff&size=128" alt="Dr. K.K. Sangle" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-[#1a1a2e] flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-[1.1rem] font-semibold inline-block relative pb-2 mb-4">
                    Dr. K.K. Sangle
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-12 h-0.5 bg-[#c62828]"></span>
                  </h3>
                  <p className="text-[0.95rem] mb-1 font-medium text-[#1a1a2e]">Department – Mathematics</p>
                  <p className="text-[0.95rem] text-[#333]">Email: hod_math[at]hs[dot]vjti[dot]ac[dot]in</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="landing-footer">
        <p>
          &copy; {new Date().getFullYear()} Veermata Jijabai Technological
          Institute. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
