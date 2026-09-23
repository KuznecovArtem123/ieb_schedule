import axiosClient from "@/shared/api/client";
import { withCache } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { EduCategory, Group } from "../model/types";
import { getScheduleVersion } from "@/shared/lib/schedule-version";

export const groupService = {
  get: (category: EduCategory = "spo"): Promise<Group[]> =>
    withCache(`groups:${category}`, async () => {
      const response = await axiosClient.get<Group[]>(`/groups?edu=${category}`);
      return response.data;
    }, getScheduleVersion()),

  getAll: (): Promise<Group[]> => withCache(`groups`, async () => {
    const response = await axiosClient.get<Group[]>(`/groups`);
    return response.data;
  }, getScheduleVersion()),

  getLessons: (id: number, week: Week = "this", edu: EduCategory = "spo"): Promise<Lesson[]> =>
    withCache(`group:${edu}:${id}:${week}`, async () => {
      const response = await axiosClient.get<Lesson[]>(`/lessons/fromGroup/${id}?week=${week}`);
      return response.data;
    }, getScheduleVersion(edu, week)),
};
