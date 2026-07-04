export interface AttendanceRecord {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    work_hours: number;
    extra_hours: number;
    status: string;
}