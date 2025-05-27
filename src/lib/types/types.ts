export type User = {
    username: string,
    fullName: string | null,
    email: string | null,
    phone: string | null,
    image: string | null,
}

export type Organization = {
    id: number,
    name: string,
    image: string | null,
    createdAt: Date,
    purchasePackage: string | null
}

export type Membership = {
    userId: string,
    organizationId: number,
    role: string
}

export type SessionProps = {
    user?: User,
    orgs?: Organization[],
    memberships?: Membership[],
}

export type Page = { num: number, items: any[] }