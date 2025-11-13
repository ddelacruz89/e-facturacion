import { useState, useCallback, useEffect } from "react";
import { getUnidades } from "../apis/UnidadController";
import { MgUnidad } from "../models/producto";

// Global state to share between all components
let globalUnidades: MgUnidad[] = [];
let globalLoading = false;
let globalError: string | null = null;
let subscribers: Array<() => void> = [];

// Function to notify all subscribers about state changes
const notifySubscribers = () => {
    subscribers.forEach((callback) => callback());
};

// Function to load data once
let loadPromise: Promise<void> | null = null;

const loadUnidadesOnce = async (): Promise<void> => {
    if (loadPromise) {
        return loadPromise;
    }

    loadPromise = (async () => {
        if (globalUnidades.length > 0) {
            return; // Already loaded
        }

        globalLoading = true;
        globalError = null;
        notifySubscribers();

        try {
            console.log("Loading unidades from API...");
            const data = await getUnidades();
            globalUnidades = data;
            globalError = null;
        } catch (error) {
            console.error("Error loading unidades:", error);
            globalUnidades = [];
            globalError = error instanceof Error ? error.message : "Unknown error";
        } finally {
            globalLoading = false;
            notifySubscribers();
        }
    })();

    return loadPromise;
};

export const useSharedUnidades = () => {
    const [, forceUpdate] = useState({});

    // Function to trigger re-render
    const triggerUpdate = useCallback(() => {
        forceUpdate({});
    }, []);

    useEffect(() => {
        // Subscribe to global state changes
        subscribers.push(triggerUpdate);

        // Load data if not already loaded
        loadUnidadesOnce();

        // Cleanup: remove subscriber
        return () => {
            subscribers = subscribers.filter((callback) => callback !== triggerUpdate);
        };
    }, [triggerUpdate]);

    const refresh = useCallback(async () => {
        // Reset global state and force reload
        globalUnidades = [];
        loadPromise = null;
        await loadUnidadesOnce();
    }, []);

    return {
        unidades: globalUnidades,
        loading: globalLoading,
        error: globalError,
        refresh,
    };
};
