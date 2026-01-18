import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "NGO Management System",
  description: "Registration & Donation Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
