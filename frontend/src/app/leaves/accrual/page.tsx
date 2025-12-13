import AccrualHistoryTable from "@/components/leaves/AccrualHistoryTable";
import { mockAccrualHistory } from "@/data/mockLeaves";

export default function AccrualPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">Accrual History</h1>
      <p className="text-sm text-gray-500">
        Accrual is system-generated and cannot be edited manually.
      </p>
      <AccrualHistoryTable data={mockAccrualHistory} />
    </div>
  );
}
