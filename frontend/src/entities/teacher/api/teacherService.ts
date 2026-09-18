import axiosClient from "@/shared/api/client";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { Teacher } from "../model/types";

export const teacherService = {
  get: async (): Promise<Teacher[]> => {
    const response = await axiosClient.get<Teacher[]>(`/teachers`);
    return response.data;
  },
  getLessons: async (id: number, week: Week = "this"): Promise<Lesson[]> => {
    const response = await axiosClient.get<Lesson[]>(
      `/lessons/fromTeacher/${id}?week=${week}`,
    );
    return response.data;
  },
};
