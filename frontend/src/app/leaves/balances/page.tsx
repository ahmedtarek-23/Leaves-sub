import LeaveBalanceTable from "@/components/leaves/LeaveBalanceTable";
import { mockBalances } from "@/data/mockLeaves";

export default function LeaveBalancesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Leave Balances</h1>
      <LeaveBalanceTable data={mockBalances} />
    </div>
  );
}
