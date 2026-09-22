import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './landing.css';

/* ── Phone walkthrough scenes ── */
const scenes = [
  {
    header: 'ADD EXPENSE',
    title: 'Track every rupee',
    desc: 'Add transactions with title, amount, category, and date — in seconds.',
    content: (
      <>
        <div className="scene-card">
          <div className="scene-card-row">
            <span>☕ Morning chai</span>
            <strong className="scene-amount-red">−₹30</strong>
          </div>
          <div className="scene-card-row">
            <span>🍔 Lunch</span>
            <strong className="scene-amount-red">−₹120</strong>
          </div>
          <div className="scene-card-row">
            <span>🚌 Bus fare</span>
            <strong className="scene-amount-red">−₹25</strong>
          </div>
        </div>
        <span className="scene-badge success">✓ 3 expenses logged</span>
      </>
    ),
  },
  {
    header: 'RECEIPT SCAN',
    title: 'AI reads your receipts',
    desc: 'Upload a photo or PDF — Gemini extracts every transaction automatically.',
    content: (
      <>
        <div className="scene-card">
          <div className="scene-card-row">
            <span>📄 Receipt uploaded</span>
            <span className="scene-badge violet">AI Processing</span>
          </div>
          <div className="scene-card-row">
            <span>🛒 Groceries</span>
            <strong className="scene-amount-red">−₹450</strong>
          </div>
          <div className="scene-card-row">
            <span>🧴 Toiletries</span>
            <strong className="scene-amount-red">−₹180</strong>
          </div>
        </div>
        <span className="scene-badge success">✓ Auto-parsed & saved</span>
      </>
    ),
  },
  {
    header: 'ANALYTICS',
    title: 'See where money goes',
    desc: 'Category breakdowns, monthly trends, and smart savings insights.',
    content: (
      <>
        <div className="scene-card">
          <div className="scene-card-row">
            <span>📊 This month</span>
            <strong>₹12,400</strong>
          </div>
          <div className="scene-card-row">
            <span>↗ Food</span>
            <strong className="scene-amount-red">38%</strong>
          </div>
          <div className="scene-card-row">
            <span>↗ Transport</span>
            <strong>22%</strong>
          </div>
          <div className="scene-card-row">
            <span>💰 Savings rate</span>
            <strong className="scene-amount-green">24%</strong>
          </div>
        </div>
      </>
    ),
  },
  {
    header: 'AI CHATBOT',
    title: 'Ask Bachat anything',
    desc: 'Finance questions, spending analysis, investment basics — in Hindi or English.',
    content: (
      <>
        <div className="scene-card">
          <div className="scene-card-row" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{ background: 'rgba(108,71,255,0.2)', padding: '6px 12px', borderRadius: 12, fontSize: 12 }}>Mera savings rate kitna hai?</span>
          </div>
          <div className="scene-card-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 12, fontSize: 12 }}>Aapka savings rate 24% hai — ₹3,100 bacha is month! 🎉</span>
          </div>
        </div>
        <span className="scene-badge violet">🤖 Powered by Gemini</span>
      </>
    ),
  },
  {
    header: 'INVESTMENT PLAN',
    title: 'Grow your money',
    desc: 'Personalized SIP plans for Gold, Nifty 50, Mutual Funds, and more.',
    content: (
      <>
        <div className="scene-card">
          <div className="scene-card-row">
            <span>🥇 Gold SIP</span>
            <strong className="scene-amount-green">+8.2%</strong>
          </div>
          <div className="scene-card-row">
            <span>📈 Nifty 50</span>
            <strong className="scene-amount-green">+14.5%</strong>
          </div>
          <div className="scene-card-row">
            <span>₿ Bitcoin</span>
            <strong className="scene-amount-green">+22.1%</strong>
          </div>
        </div>
        <span className="scene-badge success">✓ 1-Year growth data</span>
      </>
    ),
  },
];

const faqs = [
  {
    q: 'Is my data safe?',
    a: 'Your data is stored securely in MongoDB with encrypted connections. We use Google OAuth for authentication — we never store your password. All API calls are served over HTTPS.',
  },
  {
    q: 'Does it connect to my bank?',
    a: 'No. Bachat does not connect to any bank account. You add transactions manually, via receipt scan, or voice input. Your financial data stays with you.',
  },
  {
    q: 'Is the investment advice real?',
    a: 'Investment plans are educational projections based on past 1-year market growth from Yahoo Finance. They are not personalized investment advice. Always consult a financial advisor.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [activeScene, setActiveScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auto-advance phone walkthrough
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % scenes.length);
    }, 2250);
    return () => clearInterval(timer);
  }, [paused]);

  // Navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    document.title = 'IIITL Bachat · AI-Powered Personal Finance';
  }, []);

  const handleGetStarted = useCallback(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  }, [navigate]);

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="landing-brand">
          IIITL <span>Bachat</span>
        </Link>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#faq">FAQ</a>
        </div>
        <button className="landing-cta-btn" onClick={handleGetStarted}>
          Get Started →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero" id="home">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span>🤖</span>
            <span>AI-Powered Finance Tracking</span>
          </div>
          <h1>
            Your money.
            <br />
            <span>Your insights.</span>
          </h1>
          <p>
            Track expenses, scan receipts with AI, get investment plans, and chat
            with your personal finance assistant — all in one place.
          </p>
          <div className="hero-actions">
            <button className="landing-cta-btn" onClick={handleGetStarted}>
              Get Started →
            </button>
            <a href="#features" className="landing-cta-btn outline">
              See Features
            </a>
          </div>
          <div className="hero-footnote">
            <span>
              🎓 Built for IIITL students & beyond.
              <br />
              <strong>
                Smart budgeting. Voice input. Family sharing.
              </strong>
            </span>
          </div>
        </div>

        {/* ── Phone Walkthrough ── */}
        <div className="phone-demo">
          <div className="phone-frame">
            <div className="phone-notch" />
            {scenes.map((scene, i) => (
              <div
                key={i}
                className={`phone-scene${i === activeScene ? ' active' : ''}`}
              >
                <div className="phone-scene-header">{scene.header}</div>
                <h3>{scene.title}</h3>
                <p>{scene.desc}</p>
                {scene.content}
              </div>
            ))}
          </div>
          <div className="walkthrough-dots">
            {scenes.map((_, i) => (
              <button
                key={i}
                className={`walkthrough-dot${i === activeScene ? ' active' : ''}`}
                onClick={() => {
                  setActiveScene(i);
                  setPaused(false);
                }}
                aria-label={`Scene ${i + 1}`}
              />
            ))}
            <button
              className="walkthrough-pause"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused ? '▶' : '⏸'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Story Strip ── */}
      <section className="landing-story" id="how-it-works">
        <h2>
          Less guessing.
          <br />
          <span>More saving.</span>
        </h2>
        <p>
          Whether you're a college student tracking mess expenses or a family
          managing shared budgets — Bachat gives you AI-powered clarity. Upload
          receipts, speak in Hindi, set weekly budgets, and let Gemini turn
          numbers into actionable insights.
        </p>
      </section>

      {/* ── Features ── */}
      <section className="landing-features" id="features">
        <div className="landing-section-heading">
          <span className="section-kicker">EVERYTHING YOU NEED</span>
          <h2>Smart features for smarter finances.</h2>
          <p>From receipt scanning to investment plans — powered by AI.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Receipt Scan</h3>
            <p>
              Upload any receipt or bank statement. Gemini extracts every
              transaction — title, amount, category — automatically.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Analytics</h3>
            <p>
              Category breakdowns, monthly trends, heatmaps, and weekly archives.
              See exactly where your money goes.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Investment Planning</h3>
            <p>
              Personalized SIP plans for Gold, Nifty 50, Mutual Funds, and
              Bitcoin — based on your real spending data.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Voice Expense Entry</h3>
            <p>
              Speak in Hindi, Hinglish, or English. AI transcribes and extracts
              transaction details from your voice.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">👨‍👧</div>
            <h3>Family Mode</h3>
            <p>
              Share a wallet with family or friends. Set budgets together, flag
              overspending, and keep conversations clear.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Weekly Budgets</h3>
            <p>
              Set category-wise weekly targets. Track progress with color-coded
              bars. Get flagged when you go over budget.
            </p>
          </article>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="landing-steps">
        <div className="landing-section-heading">
          <h2>Get started in three steps.</h2>
          <p>No bank connection needed. Just start tracking.</p>
        </div>
        <div className="steps-grid">
          {[
            {
              n: '01',
              title: 'Create your account',
              text: 'Sign up with email or Google. Set your avatar and jump in.',
            },
            {
              n: '02',
              title: 'Add your expenses',
              text: 'Type, speak, or scan a receipt. Bachat fills in the rest.',
            },
            {
              n: '03',
              title: 'Get smart insights',
              text: 'See analytics, set budgets, get investment plans, chat with AI.',
            },
          ].map((step) => (
            <div className="step-item" key={step.n}>
              <div className="step-number">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <section className="landing-cta-banner">
        <h2>
          Ready to take control
          <br />
          of your finances?
        </h2>
        <p>Join thousands of students managing money smarter with AI.</p>
        <button className="landing-cta-btn" onClick={handleGetStarted}>
          Start for Free →
        </button>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-faq" id="faq">
        <div className="landing-section-heading">
          <h2>Frequently asked questions.</h2>
          <p>Quick answers to common questions.</p>
        </div>
        <div>
          {faqs.map(({ q, a }) => (
            <details className="faq-item" key={q}>
              <summary>
                {q}
                <span className="faq-icon">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div>
            <Link to="/" className="landing-brand" style={{ fontSize: 18 }}>
              IIITL <span>Bachat</span>
            </Link>
            <span style={{ fontSize: 13, color: 'var(--pp-text-muted)' }}>
              AI-powered personal finance companion.
            </span>
          </div>
          <div>
            <strong>App</strong>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div>
            <strong>Explore</strong>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <strong>Source</strong>
            <a
              href="https://github.com/khushalmidha/IIITLBachat"
              target="_blank"
              rel="noreferrer"
            >
              GitHub →
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} IIITL Bachat</span>
          <span>Built with ❤️ at IIITL</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
