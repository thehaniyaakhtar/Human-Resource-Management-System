import { useEffect, useState } from "react";
import { getMyAttendance } from "../api/attendance";
import { AttendanceRecord } from "../types/attendance";

export default function useAttendance() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        try {
            const res = await getMyAttendance();
            setRecords(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    return {
        records,
        loading,
        refresh: fetchAttendance,
    };
}