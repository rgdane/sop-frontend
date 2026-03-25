import { useState, useCallback, useEffect } from 'react';

interface CursorPaginationOptions {
    pageSize?: number;
    initialPage?: number;
}

interface CursorPaginationState {
    current: number;
    pageSize: number;
    total: number;
}

interface CursorData {
    next: number | null;
    prev: number | null;
}

interface FetchParams {
    [key: string]: any;
    LIMIT: number;
    next?: number;
    prev?: number;
}

interface FetchResponse<T> {
    data: T[];
    next?: number;
    prev?: number;
    total?: number;
}

interface UseCursorPaginationReturn<T> {
    data: T[];
    loading: boolean;
    pagination: CursorPaginationState;
    cursors: CursorData;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    goToNextPage: () => void;
    goToPrevPage: () => void;
    refetch: () => Promise<void>;
    setPage: (page: number) => void;
    reset: () => void;
}

export function useCursorPagination<T = any>(
    fetchFunction: (params: FetchParams) => Promise<FetchResponse<T>>,
    options: CursorPaginationOptions = {}
): UseCursorPaginationReturn<T> {
    const { pageSize = 20, initialPage = 1 } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<CursorPaginationState>({
        current: initialPage,
        pageSize,
        total: 0,
    });
    const [cursors, setCursors] = useState<CursorData>({
        next: null,
        prev: null,
    });

    const fetchData = useCallback(
        async (next?: number, prev?: number) => {
            setLoading(true);
            try {
                const params: FetchParams = {
                    LIMIT: pageSize,
                };

                if (next) {
                    params.next = next;
                } else if (prev) {
                    params.prev = prev;
                }

                const response = await fetchFunction(params);

                setData(response.data);
                setCursors({
                    next: response.next || null,
                    prev: response.prev || null,
                });
                setPagination((prev) => ({
                    ...prev,
                    total: response.total || 0,
                }));
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        },
        [fetchFunction, pageSize]
    );

    const goToNextPage = useCallback(() => {
        if (!cursors.next) return;

        setPagination((prev) => ({
            ...prev,
            current: prev.current + 1,
        }));
        fetchData(cursors.next);
    }, [cursors.next, fetchData]);

    const goToPrevPage = useCallback(() => {
        if (!cursors.prev) return;

        setPagination((prev) => ({
            ...prev,
            current: prev.current - 1,
        }));
        fetchData(undefined, cursors.prev);
    }, [cursors.prev, fetchData]);

    const setPage = useCallback(
        (page: number) => {
            setPagination((prev) => ({
                ...prev,
                current: page,
            }));
            if (page === 1) {
                fetchData();
            }
        },
        [fetchData]
    );

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    const reset = useCallback(() => {
        setPagination({
            current: 1,
            pageSize,
            total: 0,
        });
        setCursors({
            next: null,
            prev: null,
        });
        fetchData();
    }, [pageSize, fetchData]);

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        loading,
        pagination,
        cursors,
        hasNextPage: cursors.next !== null,
        hasPrevPage: cursors.prev !== null,
        goToNextPage,
        goToPrevPage,
        refetch,
        setPage,
        reset,
    };
}

export default useCursorPagination;