import { UserLogin } from "@/components/Login/Login";
import { AuthMain } from "@/components/Main";
import { ReactNode } from "react";

export default function Page(): ReactNode {
  return (
    <AuthMain>
      <UserLogin path={["buyback", "login"]} />
    </AuthMain>
  );
}
