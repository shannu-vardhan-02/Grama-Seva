export default function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
          Village Connect
        </h1>
        <p
          style={{
            margin: "1rem 0 0",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
          }}
        >
          Coming Soon...
        </p>
      </div>
    </main>
  );
}
