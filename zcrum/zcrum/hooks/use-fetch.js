import { useState, useCallback } from 'react';
import { toast } from "sonner";

// 发起异步请求并管理请求的状态（数据、加载、错误）
const useFetch = (cb) => {
    const [ data, setData ] = useState(undefined);
    const [ loading, setLoading ] = useState(null);
    const [ error, setError ] = useState(null);

    const fn  = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
        } catch (error) {
            setError(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        fn,
        setData
    };

};

export default useFetch;

