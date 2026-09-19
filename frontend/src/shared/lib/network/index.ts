// useIsOnline — для компонентов, getIsOnline — для обычного кода (сервисы и т.п.):
// хук нельзя вызвать вне рендера, поэтому наружу отдаём оба способа чтения.
export { useIsOnline } from './useIsOnline';
export { getIsOnline, reportNetworkError, reportNetworkSuccess } from './store';
export { isNetworkError } from './isNetworkError';
