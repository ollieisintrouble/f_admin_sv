export type Transaction = {
    id: number | null;
    amount: number;
    description: string | null;
    method: string | null
    createdBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    status: string | null;
    type: string | null;
    recordedDate: Date | null;
};