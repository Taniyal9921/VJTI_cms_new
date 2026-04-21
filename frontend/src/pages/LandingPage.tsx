import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* ── White Header ─────────────────────────────────────── */}
      <header className="landing-header" id="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-logo-link">
            <img
              src="/assets/vjti-logo-wide.png"
              alt="Veermata Jijabai Technological Institute"
              className="landing-logo-img"
            />
          </Link>
          <Link to="/login" className="landing-login-btn" id="landing-login-btn">
            Login
          </Link>
        </div>
      </header>

      {/* ── Red Navigation Bar ───────────────────────────────── */}
      <nav className="landing-nav" id="landing-nav">
        <ul className="landing-nav-list">
          <li>
            <Link to="/" className="landing-nav-link landing-nav-link--active">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="landing-nav-link">
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="landing-nav-link">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Welcome Section ──────────────────────────────────── */}
      <section className="landing-welcome" id="landing-welcome">
        <div className="landing-welcome-inner">
          <div className="landing-welcome-text">
            <h1 className="landing-welcome-title">Welcome to VJTI</h1>
            <p className="landing-welcome-desc">
              VJTI operates as an autonomous institution under the ownership of
              the Maharashtra State Government. The institute offers a diverse
              range of programs in engineering and technology spanning diploma,
              undergraduate, postgraduate, and doctoral levels.
            </p>
            <p className="landing-welcome-desc landing-welcome-desc--secondary">
              Renowned for its excellence in teaching, collaborative research
              endeavors, robust industry partnerships, and a vibrant alumni
              network, VJTI stands as a beacon of quality education and
              innovation.
            </p>
            <Link to="/about" className="landing-readmore-btn" id="landing-readmore-btn">
              Read more
            </Link>
          </div>
          <div className="landing-welcome-image">
            <img
              src="/assets/vjti-gate.png"
              alt="VJTI Gate Entrance"
              className="landing-gate-img"
            />
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ─────────────────────────────────── */}
      <section className="landing-vm-section" id="landing-vision-mission">
        {/* Vision */}
        <div className="landing-vm-card" id="landing-vision">
          <div className="landing-vm-icon">
            <img src="/assets/vision-icon.png" alt="Vision" />
          </div>
          <div className="landing-vm-content">
            <h2 className="landing-vm-title">Vision</h2>
            <p className="landing-vm-text">
              To establish global leadership in the field of Technology and
              develop competent human resources for providing service to society.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="landing-vm-card" id="landing-mission">
          <div className="landing-vm-icon">
            <img src="/assets/mission-icon.png" alt="Mission" />
          </div>
          <div className="landing-vm-content">
            <h2 className="landing-vm-title">Mission</h2>
            <p className="landing-vm-text">
              To provide students with comprehensive knowledge of principles of
              engineering with a multi-disciplinary approach that is challenging.
              To create an intellectually stimulating environment for research,
              scholarship, creativity, innovation and professional activity. To
              foster relationship with other leading institutes of learning and
              research, alumni and industries in order to contribute to National
              and International development.
            </p>
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
