import { checkOut } from "../../api/attendance";

export default function CheckOutButton({ refresh }: { refresh: () => void }) {
    const handleClick = async () => {
        await checkOut();
        refresh();
    };

    return (
        <button style={{ padding: "8px 12px" }} onClick={handleClick}>
            Check Out
        </button>
    );
}