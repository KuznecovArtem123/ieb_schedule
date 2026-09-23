import { getWithEtag, withCache } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { Teacher } from "../model/types";

export const teacherService = {
  get: (): Promise<Teacher[]> =>
    withCache('teachers', (etag) =>
      getWithEtag<Teacher[]>(`/teachers`, etag)),

  getLessons: (id: number, week: Week = "this"): Promise<Lesson[]> =>
    withCache(`teacher:${id}:${week}`, (etag) =>
      getWithEtag<Lesson[]>(`/lessons/fromTeacher/${id}?week=${week}`, etag, true),
      { notFoundValue: [] }),
};
