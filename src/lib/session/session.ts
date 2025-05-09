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

            console.log(
                `Expiration time: ${new Date(expTime).toLocaleString()}`,
            );
            console.log(`Current time: ${new Date(now).toLocaleString()}`);
            console.log(
                `Time remaining: ${((expTime - now) / (1000 * 60 * 60)).toFixed(2)} hours`,
            );

            return expTime < now;
        }

        return false;
    } catch (error) {
        console.error("Error processing token:", error);
        return true;
    }
}