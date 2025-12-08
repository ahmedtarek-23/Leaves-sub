export enum ClaimStatus {
<<<<<<< Updated upstream
    UNDER_REVIEW = 'under review',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}
export enum DisputeStatus {
    UNDER_REVIEW = 'under review',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}
export enum RefundStatus {
    PENDING = 'pending',
    PAID = 'paid' // when payroll execution
=======
  UNDER_REVIEW = 'under review',
  PENDING_MANAGER_APPROVAL = 'pending payroll Manager approval',
  APPROVED = 'approved',// when manager approves
  REJECTED = 'rejected'
}
export enum DisputeStatus {
  UNDER_REVIEW = 'under review',
  PENDING_MANAGER_APPROVAL = 'pending payroll Manager approval',
  APPROVED = 'approved',// when manager approves
  REJECTED = 'rejected'
}
export enum RefundStatus {
  PENDING = 'pending',
  PAID = 'paid' // when payroll execution
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}