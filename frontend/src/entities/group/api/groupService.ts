import axiosClient from "@/shared/api/client";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { EduCategory, Group } from "../model/types";

export const groupService = {
  get: async (category: EduCategory = "spo"): Promise<Group[]> => {
    const response = await axiosClient.get<Group[]>(`/groups?edu=${category}`);
    return response.data;
  },
  getLessons: async (id: number, week: Week = "this"): Promise<Lesson[]> => {
    const response = await axiosClient.get<Lesson[]>(
      `/lessons/fromGroup/${id}?week=${week}`,
    );
    return response.data;
  },
};
