import { useState, useCallback, useEffect } from "react";

/**
 * Factoría de hooks compartidos con patrón singleton.
 * Llama al API una sola vez sin importar cuántas instancias del componente existan.
 *
 * Uso:
 *   const useSharedCategorias = createSharedHook(() => getCategoriasResumen());
 *   const { data, loading, refresh } = useSharedCategorias();
 */
export function createSharedHook<T>(fetcher: () => Promise<T[]>) {
    let globalData: T[] = [];
    let globalLoading = false;
    let globalError: string | null = null;
    let subscribers: Array<() => void> = [];
    let loadPromise: Promise<void> | null = null;

    const notifySubscribers = () => {
        subscribers.forEach((cb) => cb());
    };

    const loadOnce = async (): Promise<void> => {
        if (loadPromise) return loadPromise;

        loadPromise = (async () => {
            if (globalData.length > 0) return;

            globalLoading = true;
            globalError = null;
            notifySubscribers();

            try {
                globalData = await fetcher();
                globalError = null;
            } catch (error) {
                globalData = [];
                globalError = error instanceof Error ? error.message : "Unknown error";
            } finally {
                globalLoading = false;
                notifySubscribers();
            }
        })();

        return loadPromise;
    };

    return function useSharedData() {
        const [, forceUpdate] = useState({});

        const triggerUpdate = useCallback(() => {
            forceUpdate({});
        }, []);

        useEffect(() => {
            subscribers.push(triggerUpdate);
            loadOnce();
            return () => {
                subscribers = subscribers.filter((cb) => cb !== triggerUpdate);
            };
        }, [triggerUpdate]);

        const refresh = useCallback(async () => {
            globalData = [];
            loadPromise = null;
            await loadOnce();
        }, []);

        return {
            data: globalData as T[],
            loading: globalLoading,
            error: globalError,
            refresh,
        };
    };
}
