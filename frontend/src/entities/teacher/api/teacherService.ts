import { getWithEtag, withCache, type OnCached } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { Teacher } from "../model/types";

class TeacherService {
  get(onCached?: OnCached<Teacher[]>, forceRequest = false): Promise<Teacher[]> {
    return withCache(
      "teachers",
      (etag) => getWithEtag<Teacher[]>("/teachers", etag),
      forceRequest,
      { onCached },
    );
  }

  getLessons(id: number, week: Week = "this", onCached?: OnCached<Lesson[]>, forceRequest = false): Promise<Lesson[]> {
    return withCache(
      `teacher:${id}:${week}`,
      (etag) => getWithEtag<Lesson[]>(`/lessons/fromTeacher/${id}?week=${week}`, etag, true),
      forceRequest,
      { notFoundValue: [], onCached },
    );
  }
}

export default new TeacherService();
