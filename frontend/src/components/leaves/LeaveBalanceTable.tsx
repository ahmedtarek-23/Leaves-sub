"use client";

import { LeaveBalance } from "@/types/leave";

type Props = {
  data: LeaveBalance[];
};

export default function LeaveBalanceTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Leave Type</th>
            <th className="border px-3 py-2 text-center">Accrued</th>
            <th className="border px-3 py-2 text-center">Taken</th>
            <th className="border px-3 py-2 text-center">Carry Over</th>
            <th className="border px-3 py-2 text-center">Remaining</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="border px-3 py-4 text-center text-gray-500"
              >
                No leave balance data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                <td className="border px-3 py-2">{row.leaveType}</td>
                <td className="border px-3 py-2 text-center">
                  {row.accrued}
                </td>
                <td className="border px-3 py-2 text-center">
                  {row.taken}
                </td>
                <td className="border px-3 py-2 text-center">
                  {row.carryOver}
                </td>
                <td className="border px-3 py-2 text-center">
                  {row.remaining}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
