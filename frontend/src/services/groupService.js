import axiosClient from "../api/client";

export const groupService = {
    get: async (category = 'spo') => {
        const response = await axiosClient.get('/groups/');
        return response.data.filter(x => x.department.toLowerCase() == category);
    },
    getLessons: async (id, week = 'this') => {
        const response = await axiosClient.get(`/lessons/fromGroup/${id}?week=${week}`);
        return response.data;
    }
};