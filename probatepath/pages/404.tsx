// Custom 404 page for Pages Router compatibility.
// Next.js serves this for routes not found by the App Router. Must be fully
// self-contained — no access to app/layout.tsx — so styles are inline.
import Head from "next/head";

const BRAND = "#0d1726";
const INK = "#0a0d12";
const MUTED = "#6b7280";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page not found — ProbateDesk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT,
          color: INK,
          background: "#f7f8fa",
        }}
      >
        <header
          style={{
            padding: "20px 28px",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: BRAND,
                letterSpacing: "-0.01em",
              }}
            >
              ProbateDesk
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Done
            </span>
          </a>
        </header>
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 540,
              width: "100%",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 20,
              padding: "40px 36px",
              textAlign: "center",
              boxShadow: "0 30px 70px -60px rgba(13,23,38,0.25)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Page not found
            </p>
            <h1
              style={{
                margin: "12px 0 14px 0",
                fontSize: 30,
                lineHeight: 1.2,
                color: INK,
              }}
            >
              We couldn&apos;t find that page.
            </h1>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: MUTED,
              }}
            >
              The link may have moved, or we may have taken it down. Nothing
              you&apos;ve saved is lost — your account and draft are still
              here.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/"
                style={{
                  display: "inline-block",
                  padding: "12px 22px",
                  borderRadius: 9999,
                  background: BRAND,
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Back to home
              </a>
              <a
                href="/portal"
                style={{
                  display: "inline-block",
                  padding: "12px 22px",
                  borderRadius: 9999,
                  background: "#ffffff",
                  color: BRAND,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1px solid #d1d5db",
                }}
              >
                My portal
              </a>
            </div>
            <p
              style={{
                margin: "26px 0 0 0",
                fontSize: 12,
                color: MUTED,
              }}
            >
              Need help?{" "}
              <a
                href="/contact"
                style={{ color: BRAND, textDecoration: "underline" }}
              >
                Contact us
              </a>{" "}
              or call{" "}
              <a
                href="tel:+16046703534"
                style={{ color: BRAND, textDecoration: "none" }}
              >
                (604) 670-3534
              </a>
              .
            </p>
          </div>
        </main>
        <footer
          style={{
            padding: "18px 28px",
            fontSize: 12,
            color: MUTED,
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          © ProbateDesk Technologies Inc. · Document preparation support and
          general information. We are not a law firm.
        </footer>
      </div>
    </>
  );
}
