// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User, Organization, Membership } from "$lib/types/types";

declare global {
	namespace App {
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			user?: User;
			orgs?: Organization[],
			memberships?: Membership[]
		}
	}
}

export { };
