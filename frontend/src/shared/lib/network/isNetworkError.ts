import axios from 'axios';

export function isNetworkError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response === undefined;
}
