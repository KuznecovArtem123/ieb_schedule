import axiosClient from "../api/client";

export const teacherService = {
    get: async () => {
        const response = await axiosClient.get(`/teachers`);
        return response.data;
    },
    getLessons: async (id, week = 'this') => {
        const response = await axiosClient.get(`/lessons/fromTeacher/${id}?week=${week}`);
        return response.data;
    }
};