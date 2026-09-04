import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeeNeural Task Manager",
  description: "A focused, beautifully simple task manager by BeeNeural.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
