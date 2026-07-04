import { useEffect, useState } from "react";

import {
    getAttendance,
} from "../api/attendance";

import { AttendanceRecord } from "../types/attendance";

export default function useAttendance() {

    const [records, setRecords] =
        useState<AttendanceRecord[]>([]);

    const [loading, setLoading] =
        useState(true);

    async function loadAttendance() {

        try {

            const response =
                await getAttendance();

            setRecords(response.data);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadAttendance();

    }, []);

    return {

        records,

        loading,

        refresh: loadAttendance,

    };

}