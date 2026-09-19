import axiosClient from "@/shared/api/client";
import { withCache } from "@/shared/api/withCache";
import type { Lesson, Week } from "@/entities/lesson/model/types";
import type { Teacher } from "../model/types";

export const teacherService = {
  get: (): Promise<Teacher[]> =>
    withCache('teachers', async () => {
      const response = await axiosClient.get<Teacher[]>(`/teachers`);
      return response.data;
    }),

  getLessons: (id: number, week: Week = "this"): Promise<Lesson[]> =>
    withCache(`teacher:${id}:${week}`, async () => {
      const response = await axiosClient.get<Lesson[]>(`/lessons/fromTeacher/${id}?week=${week}`);
      return response.data;
    }),
};
