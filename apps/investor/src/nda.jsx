// nda.jsx - Two-tier disclosure system.
//
//   Tier 1  always visible to verified investors
//   Tier 2  locked until the investor signs the platform-wide NDA
//   Tier 2+ deals flagged `requiresDealNda` need a per-deal addendum
//           on top of the platform NDA (borrower request)
//
// Institutional investors with an offline-negotiated NDA on file
// (`INVESTOR.institutionalNda`) pre-unlock platform-level Tier 2
// with no modal. Per-deal addenda still apply.
//
// State lives at the App level:
//   ndaSignedAt           string ISO date (platform NDA) | null
//   dealNdas              { [oppId]: ISO date } map
// Triggers carry an `intent` callback so post-signing flow returns
// the investor to the field/doc/drawer they were trying to access.

// ─────────────────────────────────────────────────────────────────
// LockedField - Tier 2 dl row when no NDA. Renders an inline lock
// icon + italic "Sign NDA to view" placeholder.
// ─────────────────────────────────────────────────────────────────
function LockedField({ label, full = false, onUnlock, dealLevel = false }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <dt style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>
        {label}
      </dt>
      <dd style={{
        margin: 0, fontSize: 13.5,
        display: "inline-flex", alignItems: "center", gap: 8,
        color: "var(--ink-3)",
        cursor: onUnlock ? "pointer" : "default",
      }} onClick={onUnlock}>
        <I.lock style={{ width: 13, height: 13, color: "var(--ink-4)" }} />
        <span style={{
          background: "linear-gradient(90deg, var(--bg-sunk) 0%, var(--bg-sunk) 60%, transparent 100%)",
          padding: "2px 12px 2px 6px",
          fontStyle: "italic",
        }}>
          {dealLevel ? "Sign deal NDA to view" : "Sign NDA to view"}
        </span>
      </dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LockedDoc - document card with translucent overlay + lock badge.
// ─────────────────────────────────────────────────────────────────
function LockedDoc({ doc, onUnlock, dealLevel = false }) {
  return (
    <div onClick={onUnlock}
      style={{
        padding: 14,
        background: "var(--bg-elev)",
        border: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}>
      <span style={{
        width: 36, height: 36,
        background: "var(--bg-sunk)", color: "var(--ink-4)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <I.doc />
      </span>
      <div style={{ minWidth: 0, filter: "blur(2.5px)", opacity: 0.5, pointerEvents: "none" }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{doc.kind}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{doc.desc}</div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4, letterSpacing: "0.04em" }}>
          {doc.ref} · {doc.ext} · {doc.size}
        </div>
      </div>
      <span style={{ color: "var(--ink-3)" }}><I.lock /></span>

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px",
          background: "rgba(14,20,24,.78)",
          color: "#f4f1ea",
          fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          <I.lock style={{ width: 11, height: 11 }} />
          {dealLevel ? "Deal NDA required" : "NDA required"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// NdaBanner - platform-level CTA at the top of Opportunities
// ─────────────────────────────────────────────────────────────────
function NdaBanner({ onSign }) {
  return (
    <div style={{
      marginTop: 16,
      padding: "16px 20px",
      background: "var(--accent-tint)",
      borderLeft: "3px solid var(--accent)",
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      gap: 16,
      alignItems: "center",
    }}>
      <span style={{
        width: 36, height: 36,
        background: "var(--accent)", color: "var(--on-accent)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <I.lock />
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-ink)", marginBottom: 2 }}>
          Unlock full deal packs
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, maxWidth: "70ch" }}>
          One signature unlocks deal packs across the CredX platform - full property addresses, valuation reports, term sheets and Decisions in Principle.
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => onSign()}>
        Sign NDA <I.arrowRight />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DealNdaPanel - replaces the "underwriting locked" panel for
// opportunities that require a per-deal addendum on top of the
// platform NDA. Less prominent than the platform CTA because the
// investor has already signed once.
// ─────────────────────────────────────────────────────────────────
function DealNdaPanel({ dealId, onSign }) {
  return (
    <div style={{
      margin: "16px 0 0",
      padding: "24px 24px",
      background: "var(--bg-sunk)",
      border: "1px dashed var(--border-2)",
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      gap: 18,
      alignItems: "center",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 40, height: 40,
        background: "var(--ink)", color: "var(--bg)",
      }}>
        <I.lock />
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>
          This deal requires an additional NDA
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: "52ch" }}>
          The borrower for <span className="mono">{dealId}</span> has requested a facility-level confidentiality agreement on top of the platform NDA already signed.
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={() => onSign()}>
        Sign deal NDA <I.arrowRight />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// NDA agreement body - placeholder lorem ipsum. JMW will replace
// with the final wording. Same surface used in both modal variants.
// ─────────────────────────────────────────────────────────────────
function NdaBody({ scopeLine }) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--bg-sunk)",
      border: "1px solid var(--border)",
      maxHeight: 240,
      overflowY: "auto",
      fontSize: 12.5,
      color: "var(--ink-2)",
      lineHeight: 1.65,
    }}>
      {scopeLine && (
        <div style={{
          padding: "8px 12px",
          marginBottom: 12,
          background: "var(--bg-elev)",
          borderLeft: "2px solid var(--accent)",
          color: "var(--ink-2)",
          fontSize: 12,
        }}>{scopeLine}</div>
      )}
      <p style={{ margin: "0 0 10px" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <p style={{ margin: "0 0 10px" }}>
        <strong style={{ color: "var(--ink)" }}>1. Confidential information.</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p style={{ margin: "0 0 10px" }}>
        <strong style={{ color: "var(--ink)" }}>2. Permitted use.</strong> Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
      </p>
      <p style={{ margin: "0 0 10px" }}>
        <strong style={{ color: "var(--ink)" }}>3. Term &amp; survival.</strong> Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
      </p>
      <p style={{ margin: "0 0 10px" }}>
        <strong style={{ color: "var(--ink)" }}>4. Exclusions.</strong> Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam.
      </p>
      <p style={{ margin: 0 }}>
        <strong style={{ color: "var(--ink)" }}>5. Governing law.</strong> Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Final wording is being drafted by JMW Solicitors.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shared signing UI - typed signature + auto date + signing-as line
// ─────────────────────────────────────────────────────────────────
function SigningBlock({ signature, setSignature, entity }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const parts = ["Signing as", signature || INVESTOR.name];
  if (entity) parts.push(entity);
  parts.push(dateStr);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 16 }}>
        <div className="field">
          <label>Type your full name to sign</label>
          <input value={signature} onChange={e => setSignature(e.target.value)}
                 placeholder="Full legal name"
                 style={{
                   fontFamily: "var(--ff-serif)", fontSize: 18, fontStyle: "italic",
                   letterSpacing: "0.02em",
                 }} />
        </div>
        <div className="field">
          <label>Date</label>
          <input value={dateStr} readOnly className="mono"
                 style={{ color: "var(--ink-3)", background: "var(--bg-sunk)" }} />
        </div>
      </div>
      <div style={{
        marginTop: 8,
        fontSize: 11.5,
        color: "var(--ink-3)",
        letterSpacing: "0.02em",
      }}>
        {parts.join(" · ")}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// NdaModal - platform-wide signing flow
// ─────────────────────────────────────────────────────────────────
function NdaModal({ open, onClose, onSign, intent }) {
  const [signature, setSignature] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (open) { setSignature(INVESTOR.name); setConfirmed(false); }
  }, [open]);

  React.useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => {
      onSign();
      if (intent) intent();
    }, 2000);
    return () => clearTimeout(t);
  }, [confirmed]);

  if (!open) return null;
  const canSign = signature.trim().length >= 3;

  return (
    <Modal open={open} onClose={confirmed ? undefined : onClose} width={680}
      title={confirmed ? "" : "Confidentiality Agreement"}
      footer={confirmed ? null : (
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canSign}
                  style={!canSign ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                  onClick={() => setConfirmed(true)}>
            Sign &amp; continue <I.arrowRight />
          </button>
        </>
      )}>
      {confirmed
        ? <NdaConfirmation message="NDA signed. Deal packs unlocked." />
        : (
          <>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.55 }}>
              One signature unlocks deal packs across the CredX platform.
            </div>
            <NdaBody />
            <SigningBlock signature={signature} setSignature={setSignature} />
          </>
        )
      }
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// DealNdaModal - per-deal addendum
// ─────────────────────────────────────────────────────────────────
function DealNdaModal({ open, opp, onClose, onSign, intent }) {
  const [signature, setSignature] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (open) { setSignature(INVESTOR.name); setConfirmed(false); }
  }, [open, opp]);

  React.useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => {
      onSign();
      if (intent) intent();
    }, 2000);
    return () => clearTimeout(t);
  }, [confirmed]);

  if (!open || !opp) return null;
  const canSign = signature.trim().length >= 3;

  return (
    <Modal open={open} onClose={confirmed ? undefined : onClose} width={680}
      title={confirmed ? "" : `Deal-Specific Confidentiality Agreement - ${opp.id}`}
      footer={confirmed ? null : (
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canSign}
                  style={!canSign ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                  onClick={() => setConfirmed(true)}>
            Sign &amp; continue <I.arrowRight />
          </button>
        </>
      )}>
      {confirmed
        ? <NdaConfirmation message={`Deal NDA signed. ${opp.id} unlocked.`} />
        : (
          <>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.55 }}>
              This agreement applies to <strong className="mono" style={{ color: "var(--ink)" }}>{opp.id}</strong> only and is in addition to your platform NDA.
            </div>
            <NdaBody scopeLine={`Scope: ${opp.title} · ${opp.id}`} />
            <SigningBlock signature={signature} setSignature={setSignature} />
          </>
        )
      }
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Post-signing confirmation
// ─────────────────────────────────────────────────────────────────
function NdaConfirmation({ message }) {
  return (
    <div style={{
      padding: "48px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56,
        background: "var(--accent-tint)", color: "var(--accent-ink)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <I.check style={{ width: 26, height: 26 }} />
      </div>
      <div style={{ fontFamily: "var(--ff-serif)", fontSize: 22, fontWeight: 420, letterSpacing: "-0.005em", marginBottom: 6 }}>
        {message}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
        Returning you to where you left off…
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function townOnly(propertyStr) {
  if (!propertyStr) return "";
  return propertyStr.split(" · ")[0];
}

// Resolve platform-level NDA state: explicit signature OR institutional
// pre-arrangement returns a usable date string.
function effectivePlatformNda(ndaSignedAt) {
  if (ndaSignedAt) return { signedAt: ndaSignedAt, kind: "platform" };
  if (INVESTOR.institutionalNda) {
    return {
      signedAt: INVESTOR.institutionalNda.signedAt,
      entity:   INVESTOR.institutionalNda.entity,
      kind:     "institutional",
    };
  }
  return null;
}

Object.assign(window, {
  LockedField, LockedDoc, NdaBanner, NdaModal, DealNdaModal, DealNdaPanel, NdaConfirmation,
  SigningBlock, NdaBody, townOnly, effectivePlatformNda,
});
