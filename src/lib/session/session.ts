export function TokenExpired(token: string): boolean {
    try {
        const [payloadBase64, signatureBase64] = token.split(".");
        if (!payloadBase64 || !signatureBase64) {
            throw new Error("Invalid token format");
        }

        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        if (payload.exp) {
            const expTime = payload.exp * 1000;
            const now = Date.now();

            return expTime < now;
        }

        return false;
    } catch (error) {
        console.error("Error processing token:", error);
        return true;
    }
}