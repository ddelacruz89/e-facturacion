export interface PagesResult<T> {
    page: number;
    size: number;
    totalPage: number;
    totalElements: number;
    content: T;
}
