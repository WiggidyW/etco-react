import LoginPage from "@/app/[...path]/page";
import { ReactNode } from "react";

export default function Page(): ReactNode {
  return <LoginPage params={{ path: ["buyback", "login"] }} />;
}
