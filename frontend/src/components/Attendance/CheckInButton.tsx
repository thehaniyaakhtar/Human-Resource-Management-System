import { checkIn } from "../../api/attendance";

interface Props {

    refresh: () => void;

}

export default function CheckInButton({

    refresh,

}: Props) {

    async function handleClick() {

        await checkIn();

        refresh();

    }

    return (

        <button onClick={handleClick}>

            Check In

        </button>

    );

}