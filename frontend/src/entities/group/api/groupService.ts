import { getWithEtag, withCache } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { EduCategory, Group } from "../model/types";

export const groupService = {
  get: (category: EduCategory = "spo"): Promise<Group[]> =>
    withCache(`groups:${category}`, (etag) =>
      getWithEtag<Group[]>(`/groups?edu=${category}`, etag)),

  getAll: (): Promise<Group[]> => withCache(`groups`, (etag) =>
    getWithEtag<Group[]>(`/groups`, etag)),

  getLessons: (id: number, week: Week = "this"): Promise<Lesson[]> =>
    withCache(`group:${id}:${week}`, (etag) =>
      getWithEtag<Lesson[]>(`/lessons/fromGroup/${id}?week=${week}`, etag, true),
      { notFoundValue: [] }),
};
