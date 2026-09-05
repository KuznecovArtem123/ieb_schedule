import axiosClient from "../api/client";

export const teacherService = {
    get: async () => {
        const response = await axiosClient.get(`/teachers`);
        return response.data;
    },
    getLessons: async (id) => {
        const response = await axiosClient.get(`/lessons/fromTeacher/${id}`);
        return response.data;
    }
};