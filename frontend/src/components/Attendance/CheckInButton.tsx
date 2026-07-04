import { checkIn } from "../../api/attendance";

export default function CheckInButton({ refresh }: { refresh: () => void }) {
    const handleClick = async () => {
        await checkIn();
        refresh();
    };

    return (
        <button style={{ padding: "8px 12px" }} onClick={handleClick}>
            Check In
        </button>
    );
}