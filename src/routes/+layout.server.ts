export function load({ locals }) {
    return {
        user: locals.user || null,
        orgs: locals.orgs || null,
        memberships: locals.memberships || null,
    };
}