export type ColorValue = string;

export interface ColorMapping {
    [type: string]: {
        [label: string]: ColorValue;
    };
}

export const colorMap: ColorMapping = {
    assetType: {
        Server: "indigo",
        Digital: "pink",
        Device: "amber",
        Cloud: "sky",
        Others: "slate",
    },
    assetStatus: {
        Active: "emerald",
        Idle: "slate",
        Maintenance: "rose",
        Abandoned: "amber",
    },
    transactionType: {
        Sale: "emerald",
        Asset: "sky",
        Campaign: "pink",
        Building: "purple",
        Fees: "amber",
        Payday: "teal",
    },
    transactionStatus: {
        Paid: "pink",
        Planned: "amber",
    },
    productType: {
        Tool: "blue",
        SaaS: "purple",
        App: "lime",
    },
    productStatus: {
        Production: "emerald",
        Building: "blue",
        Planned: "amber",
        EOL: "gray",
    },
};

export function getColor(type: string, label: string): ColorValue {
    if (colorMap[type] && colorMap[type][label]) {
        return colorMap[type][label];
    }
    return "slate";
}
