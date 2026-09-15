import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Кабинет учителя — журнал домашних заданий",
  description:
    "Журнал сданных домашних заданий по Python: работы учеников, код решений и отметки. Доступ по ключу учителя.",
  robots: { index: false, follow: false },
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
