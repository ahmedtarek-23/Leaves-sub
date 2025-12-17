import { LeaveStatus } from "../../../types/leaves";

export default function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
    let styles = "bg-gray-100 text-gray-800";

    switch (status) {
        case LeaveStatus.APPROVED:
            styles = "bg-green-100 text-green-800 border-green-200";
            break;
        case LeaveStatus.REJECTED:
        case LeaveStatus.CANCELLED:
            styles = "bg-red-100 text-red-800 border-red-200";
            break;
        case LeaveStatus.PENDING:
            styles = "bg-yellow-100 text-yellow-800 border-yellow-200";
            break;
        case LeaveStatus.ESCALATED:
            styles = "bg-purple-100 text-purple-800 border-purple-200";
            break;
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${styles}`}>
            {status}
        </span>
    );
}
