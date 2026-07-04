import { AttendanceRecord } from "../../types/attendance";

interface Props {

    records: AttendanceRecord[];

}

export default function AttendanceTable({

    records,

}: Props) {

    return (

        <table className="w-full">

            <thead>

                <tr>

                    <th>Date</th>

                    <th>Check In</th>

                    <th>Check Out</th>

                    <th>Hours</th>

                    <th>Status</th>

                </tr>

            </thead>

            <tbody>

                {records.map((record) => (

                    <tr key={record.id}>

                        <td>{record.date}</td>

                        <td>

                            {record.check_in
                                ? new Date(
                                      record.check_in
                                  ).toLocaleTimeString()
                                : "-"}

                        </td>

                        <td>

                            {record.check_out
                                ? new Date(
                                      record.check_out
                                  ).toLocaleTimeString()
                                : "-"}

                        </td>

                        <td>{record.work_hours}</td>

                        <td>{record.status}</td>

                    </tr>

                ))}

            </tbody>

        </table>

    );

}