import useAttendance from "../../hooks/useAttendance";
import AttendanceTable from "../../components/Attendance/AttendanceTable";
import CheckInButton from "../../components/Attendance/CheckInButton";
import CheckOutButton from "../../components/Attendance/CheckOutButton";

export default function EmployeeAttendance() {
    const { records, loading, refresh } = useAttendance();

    if (loading) return <div>Loading attendance...</div>;

    return (
        <div style={{ padding: "20px" }}>
            
            <h2>My Attendance</h2>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <CheckInButton refresh={refresh} />
                <CheckOutButton refresh={refresh} />
            </div>

            {/* Table */}
            <AttendanceTable records={records} />

        </div>
    );
}