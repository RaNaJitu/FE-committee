import { useCallback, useEffect, useMemo, useState } from "react";
import { getCommittees } from "../services/apiClient.js";

const STATUS = {
    idle: "idle",
    loading: "loading",
    success: "success",
    error: "error",
};

export function useCommittees({ token, enabled = true } = {}) {
    const [state, setState] = useState({
        status: STATUS.idle,
        data: [],
        meta: null,
        error: null,
    });

    const fetchCommittees = useCallback(async () => {
        if (!token) {
            setState({
                status: STATUS.error,
                data: [],
                meta: null,
                error: new Error("Missing authentication token"),
            });
            return;
        }

        setState((current) => ({
            ...current,
            status: STATUS.loading,
            data: current.data ?? [],
            meta: current.meta ?? null,
            error: null,
        }));

        try {
            const committees = await getCommittees(token);
            const normalizedData = Array.isArray(committees)
                ? committees
                : Array.isArray(committees?.data)
                    ? committees.data
                    : [];
            const meta = committees?.meta ?? null;
            setState({
                status: STATUS.success,
                data: normalizedData,
                meta,
                error: null,
            });
        } catch (error) {
            setState({
                status: STATUS.error,
                data: [],
                meta: null,
                error,
            });
        }
    }, [token]);

    useEffect(() => {
        if (enabled && token) {
            fetchCommittees();
        }
    }, [enabled, token, fetchCommittees]);

    const isLoading = state.status === STATUS.loading;
    const isError = state.status === STATUS.error;
    const isSuccess = state.status === STATUS.success;

    return useMemo(
        () => ({
            committees: state.data,
            meta: state.meta,
            status: state.status,
            error: state.error,
            isLoading,
            isError,
            isSuccess,
            refresh: fetchCommittees,
        }),
        [state, isLoading, isError, isSuccess, fetchCommittees],
    );
}

