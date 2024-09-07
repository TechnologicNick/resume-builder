import { SandpackCSS } from "@/components/sandpack-styles";

export const metadata = {
  title: "ResumeSX",
  description: "Fine-tune your resume in React",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <SandpackCSS />
      </head>
      <body>{children}</body>
    </html>
  );
}
