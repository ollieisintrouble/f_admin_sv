import { writable } from "svelte/store";
import type { User, Organization, Membership } from "$lib/types/types";

export const user = writable<User | null>(null);
export const orgs = writable<Organization[]>([]);
export const currentOrg = writable<Organization | null>(null);
export const memberships = writable<Membership[]>([]);
export const isValidating = writable(true);
