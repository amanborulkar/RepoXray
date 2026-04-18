export default function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "4px 0",
        animation: "messageIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* AI avatar orb */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, var(--brand), var(--blue))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          boxShadow: "0 0 16px rgba(16,185,129,0.45)",
          animation: "pulseGlow 2s ease-in-out infinite",
        }}
      >
        ⚡
      </div>

      {/* Bubble with bouncing dots */}
      <div
        className="chat-ai-msg"
        style={{ padding: "12px 18px", display: "flex", alignItems: "center" }}
      >
        <div className="typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
