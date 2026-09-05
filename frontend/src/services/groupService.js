import axiosClient from "../api/client";

export const groupService = {
    get: async (category = 'spo') => {
        const response = await axiosClient.get(`/groups?edu=${category}`);
        return response.data;
    },
    getLessons: async (id, week = 'this') => {
        const response = await axiosClient.get(`/lessons/fromGroup/${id}?week=${week}`);
        return response.data;
    }
};