export default function Template2Home({ site, user }: any) {
  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 40, color: "#0070f3" }}>
        Template 2 — Active for {site}
      </h1>
      <p>User: {user?.name}</p>

      <div style={{ marginTop: 30, padding: 20, background: "#eee" }}>
        This is a dummy Template 2 preview page.
      </div>
    </div>
  );
}
