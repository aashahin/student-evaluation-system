import PocketBase from "pocketbase";
import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";

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
        });
    });

    return singletonClient;
}

export function serverPB(cookieStore?: ReadonlyRequestCookies) {
    if (!process.env.NEXT_PUBLIC_POCKETBASE_API_URL) {
        throw new Error("Pocketbase API url not defined !");
    }

    if (typeof window !== "undefined") {
        throw new Error(
            "This method is only supposed to call from the Server environment"
        );
    }

    const client = new PocketBase(
        process.env.NEXT_PUBLIC_POCKETBASE_API_URL
    );

    if (cookieStore) {
        const authCookie = cookieStore.get("pb_auth");

        if (authCookie) {
            client.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
        }
    }

    return client;
}
