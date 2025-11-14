import { useState, useCallback, useEffect } from "react";
import { getSuplidores } from "../apis/SuplidorController";
import { InSuplidor } from "../models/inventario";

// Global state to share between all components
let globalSuplidores: InSuplidor[] = [];
let globalLoading = false;
let globalError: string | null = null;
let subscribers: Array<() => void> = [];

// Function to notify all subscribers about state changes
const notifySubscribers = () => {
    subscribers.forEach((callback) => callback());
};

// Function to load data once
let loadPromise: Promise<void> | null = null;

const loadSuplidoresOnce = async (): Promise<void> => {
    if (loadPromise) {
        return loadPromise;
    }

    loadPromise = (async () => {
        if (globalSuplidores.length > 0) {
            return; // Already loaded
        }

        globalLoading = true;
        globalError = null;
        notifySubscribers();

        try {
            console.log("Loading suplidores from API...");
            const data = await getSuplidores();
            globalSuplidores = data;
            globalError = null;
        } catch (error) {
            console.error("Error loading suplidores:", error);
            globalSuplidores = [];
            globalError = error instanceof Error ? error.message : "Unknown error";
        } finally {
            globalLoading = false;
            notifySubscribers();
        }
    })();

    return loadPromise;
};

export const useSharedSuplidores = () => {
    const [, forceUpdate] = useState({});

    // Function to trigger re-render
    const triggerUpdate = useCallback(() => {
        forceUpdate({});
    }, []);

    useEffect(() => {
        // Subscribe to global state changes
        subscribers.push(triggerUpdate);

        // Load data if not already loaded
        loadSuplidoresOnce();

        // Cleanup: remove subscriber
        return () => {
            subscribers = subscribers.filter((callback) => callback !== triggerUpdate);
        };
    }, [triggerUpdate]);

    const refresh = useCallback(async () => {
        // Reset global state and force reload
        globalSuplidores = [];
        loadPromise = null;
        await loadSuplidoresOnce();
    }, []);

    return {
        suplidores: globalSuplidores,
        loading: globalLoading,
        error: globalError,
        refresh,
    };
};
