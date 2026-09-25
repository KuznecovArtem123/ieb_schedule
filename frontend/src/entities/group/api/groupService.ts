import { getWithEtag, withCache, type OnCached } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { EduCategory, Group } from "../model/types";

class GroupService {
  get(category: EduCategory = "spo", onCached?: OnCached<Group[]>, forceRequest = false): Promise<Group[]> {
    return withCache(
      `groups:${category}`,
      (etag) => getWithEtag<Group[]>(`/groups?edu=${category}`, etag),
      forceRequest,
      { onCached },
    );
  }

  getAll(onCached?: OnCached<Group[]>, forceRequest = false): Promise<Group[]> {
    return withCache(
      "groups",
      (etag) => getWithEtag<Group[]>("/groups", etag),
      forceRequest,
      { onCached },
    );
  }

  getLessons(id: number, week: Week = "this", onCached?: OnCached<Lesson[]>, forceRequest = false): Promise<Lesson[]> {
    return withCache(
      `group:${id}:${week}`,
      (etag) => getWithEtag<Lesson[]>(`/lessons/fromGroup/${id}?week=${week}`, etag, true),
      forceRequest,
      { notFoundValue: [], onCached },
    );
  }
}

export default new GroupService();
