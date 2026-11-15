export const metadata = { title: "SafariSauti — AI Safari Concierge" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#0b1a12",
          color: "#e8f5e9",
        }}
      >
        {children}
      </body>
    </html>
  );
}
