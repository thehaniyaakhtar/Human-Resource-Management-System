import { checkOut } from "../../api/attendance";

interface Props {

    refresh: () => void;

}

export default function CheckOutButton({

    refresh,

}: Props) {

    async function handleClick() {

        await checkOut();

        refresh();

    }

    return (

        <button onClick={handleClick}>

            Check Out

        </button>

    );

}