import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DishCover",
  description: "Restaurant suggestions for friend groups",
  links: [
    {
      rel: "stylesheet",
      href: "https://api.fontshare.com/v2/css?f[]=satoshi@1,400,500,700&display=swap",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
