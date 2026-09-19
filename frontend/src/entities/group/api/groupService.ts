import axiosClient from "@/shared/api/client";
import { withCache } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { EduCategory, Group } from "../model/types";

export const groupService = {
  get: (category: EduCategory = "spo"): Promise<Group[]> =>
    withCache(`groups:${category}`, async () => {
      const response = await axiosClient.get<Group[]>(`/groups?edu=${category}`);
      return response.data;
    }),

  getLessons: (id: number, week: Week = "this"): Promise<Lesson[]> =>
    withCache(`group:${id}:${week}`, async () => {
      const response = await axiosClient.get<Lesson[]>(`/lessons/fromGroup/${id}?week=${week}`);
      return response.data;
    }),
};
