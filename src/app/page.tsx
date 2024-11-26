import {cookies} from "next/headers";
import {serverPB} from "@/lib/api";
import {redirect} from "next/navigation";

export default async function Home() {
    const cookieStore = await cookies();
    const client = serverPB(cookieStore);
    const role = client.authStore.record!["role"];

    if (role === "teacher") {
        redirect("/teacher");
    } else {
        return (
            <div>
                <h1>Home</h1>
            </div>
        )
    }
}
