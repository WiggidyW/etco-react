import { UserLogin } from "@/components/Login/Login";
import { AuthMain } from "@/components/Main";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export default function Page({
  params: { path },
}: {
  params: { path: string[] };
}): ReactNode {
  if (path[path.length - 1] === "login") {
    return (
      <AuthMain>
        <UserLogin path={path} />
      </AuthMain>
    );
  } else {
    return notFound();
  }
}
