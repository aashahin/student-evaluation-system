import { cookies } from "next/headers";
import { serverPB } from "@/lib/api";
import TeacherDashboard from "@/components/dashboard/teacher/page";
import StudentDashboard from "@/components/dashboard/student/page";
import ParentDashboard from "@/components/dashboard/parent/page";

export default async function Home() {
  const cookieStore = await cookies();
  const client = serverPB(cookieStore);
  const role = client.authStore.record ? client.authStore.record["role"] : "";

  if (role === "teacher") {
    return <TeacherDashboard />;
  } else if (role === "student") {
    return <StudentDashboard />;
  } else {
    return <ParentDashboard />;
  }
}
