export type Asset = {
    id: number;
    title: string;
    cost: number;
    description: string | null;
    createdBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    status: string | null;
    type: string | null;
    purchaseDate: Date | null;
};