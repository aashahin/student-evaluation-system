import PocketBase from "pocketbase";

let singletonClient: PocketBase | null = null;

export function pb() {
    if (!process.env.NEXT_PUBLIC_POCKETBASE_API_URL) {
        throw new Error("Pocketbase API url not defined !");
    }

    const createNewClient = () => {
        return new PocketBase(
            process.env.NEXT_PUBLIC_POCKETBASE_API_URL
        );
    };

    const _singletonClient = singletonClient ?? createNewClient();

    if (typeof window === "undefined") return _singletonClient;

    if (!singletonClient) singletonClient = _singletonClient;

    singletonClient.authStore.onChange(() => {
        document.cookie = singletonClient!.authStore.exportToCookie({
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
        });
    });

    return singletonClient;
}