import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Урок 1: Python с нуля — интерактивный урок для подготовки к ЕГЭ",
  description:
    "Первый урок Python для подготовки к ЕГЭ по информатике: print(), input(), переменные, арифметика, // и %, задачи в стиле ЕГЭ. Встроенный редактор Python — код выполняется прямо в браузере.",
  keywords: [
    "Python",
    "ЕГЭ",
    "информатика",
    "программирование",
    "урок",
    "редактор Python онлайн",
  ],
  openGraph: {
    title: "Урок 1: Python с нуля — подготовка к ЕГЭ",
    description:
      "Интерактивный первый урок Python со встроенным редактором кода: переменные, ввод-вывод, арифметика и задачи в стиле ЕГЭ.",
    siteName: "Python для ЕГЭ",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f7f4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
