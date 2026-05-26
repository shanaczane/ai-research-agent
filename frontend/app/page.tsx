"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResearch() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    setElapsed(null);
    setError(null);
    const start = Date.now();

    try {
      const res = await fetch("http://localhost:8000/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to research agent");
    } finally {
      setElapsed((Date.now() - start) / 1000);
      setLoading(false);
    }
  }

  function handleReset() {
    setQuestion("");
    setAnswer(null);
    setElapsed(null);
    setError(null);
  }

  const showInput = !loading && answer === null && error === null;
  const showResults = !loading && (answer !== null || error !== null);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--navy)",
        padding: "3rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "42rem",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >

        {/* ── HEADER ── */}
        <header className="widget" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <span className="status-dot" />
            <span
              style={{
                fontFamily: "var(--font-terminal)",
                color: "var(--mint)",
                fontSize: "1.25rem",
                letterSpacing: "0.15em",
              }}
            >
              ONLINE
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(0.55rem, 2.2vw, 0.875rem)",
              marginBottom: "0.75rem",
            }}
          >
            AI_RESEARCH_AGENT.exe
          </h1>

          <p
            style={{
              fontFamily: "var(--font-terminal)",
              color: "var(--sky)",
              fontSize: "1.35rem",
              letterSpacing: "0.06em",
            }}
          >
            powered by web search + groq
          </p>
        </header>

        {/* ── 01 / INPUT ── */}
        {showInput && (
          <section className="widget" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                fontFamily: "var(--font-terminal)",
                color: "var(--sky)",
                fontSize: "1.15rem",
                letterSpacing: "0.12em",
              }}
            >
              01 / ASK A QUESTION
            </div>

            <textarea
              className="research-textarea"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleResearch();
              }}
              rows={5}
              placeholder="Enter your research question..."
            />

            <button
              onClick={handleResearch}
              disabled={!question.trim()}
              style={{
                width: "100%",
                fontFamily: "var(--font-pixel)",
                fontSize: "0.7rem",
                padding: "14px 24px",
                background: question.trim() ? "var(--bright)" : "rgba(30, 94, 255, 0.25)",
                color: question.trim() ? "var(--white)" : "var(--sky)",
                border: "none",
                borderRadius: "6px",
                cursor: question.trim() ? "pointer" : "not-allowed",
                boxShadow: "4px 4px 0 #050d1a",
                transition: "background 0.2s, color 0.2s",
                opacity: question.trim() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (!question.trim()) return;
                e.currentTarget.style.background = "var(--cyan)";
                e.currentTarget.style.color = "var(--navy)";
              }}
              onMouseLeave={(e) => {
                if (!question.trim()) return;
                e.currentTarget.style.background = "var(--bright)";
                e.currentTarget.style.color = "var(--white)";
              }}
            >
              RESEARCH →
            </button>
          </section>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <section
            className="widget"
            style={{
              textAlign: "center",
              padding: "3rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-terminal)",
                color: "var(--sky)",
                fontSize: "1.15rem",
                letterSpacing: "0.12em",
              }}
            >
              01 / ASK A QUESTION
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--white)",
                fontSize: "0.95rem",
                opacity: 0.55,
                lineHeight: 1.6,
              }}
            >
              {question}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
              }}
            >
              <span className="status-dot" />
              <span
                className="animate-searching"
                style={{
                  fontFamily: "var(--font-pixel)",
                  color: "var(--cyan)",
                  fontSize: "0.65rem",
                  textShadow: "0 0 10px var(--cyan), 0 0 20px rgba(0, 229, 255, 0.4)",
                  letterSpacing: "0.05em",
                }}
              >
                SEARCHING THE WEB...
              </span>
            </div>
          </section>
        )}

        {/* ── 02 / RESULTS ── */}
        {showResults && (
          <section className="widget" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div
              style={{
                fontFamily: "var(--font-terminal)",
                color: "var(--sky)",
                fontSize: "1.15rem",
                letterSpacing: "0.12em",
              }}
            >
              02 / RESEARCH RESULTS
            </div>

            {/* Answer card */}
            <div className="widget animate-glow-pulse">
              {error ? (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--pink)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  ⚠ {error}
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--white)",
                    fontSize: "0.95rem",
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {answer}
                </p>
              )}
            </div>

            {elapsed !== null && (
              <p
                style={{
                  fontFamily: "var(--font-terminal)",
                  color: "var(--mint)",
                  fontSize: "1.1rem",
                  letterSpacing: "0.1em",
                }}
              >
                ⚡ COMPLETED IN {elapsed.toFixed(2)}s
              </p>
            )}

            <button
              onClick={handleReset}
              style={{
                width: "100%",
                fontFamily: "var(--font-pixel)",
                fontSize: "0.7rem",
                padding: "14px 24px",
                background: "transparent",
                color: "var(--sky)",
                border: "1px solid var(--blue)",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: "4px 4px 0 #050d1a",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--cyan)";
                e.currentTarget.style.color = "var(--cyan)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--blue)";
                e.currentTarget.style.color = "var(--sky)";
              }}
            >
              RESEARCH AGAIN
            </button>
          </section>
        )}

      </div>
    </main>
  );
}
