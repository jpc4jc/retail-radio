export const metadata = {
  title: "Retail Radio — AI-Powered Market Broadcasts",
  description: "AI-generated retail market analysis, written and broadcast in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0A0A0A" }}>
        {children}
      </body>
    </html>
  );
}
