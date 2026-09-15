"use client";

import { useEffect } from "react";

/*
 * Помечает страницу урока 2: по этим атрибутам коллаборация
 * выбирает комнату по умолчанию и подписи разделов.
 */
export function SetLessonRoom({ room, lesson }: { room: string; lesson: string }) {
  useEffect(() => {
    document.body.dataset.lessonRoom = room;
    document.body.dataset.lesson = lesson;
  }, [room, lesson]);
  return null;
}
