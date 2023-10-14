import LoginPage from "@/app/[...path]/page";
import { ReactNode } from "react";

const PATH_ARRAY = ["buyback", "login"];

export default function Page(): ReactNode {
  return <LoginPage params={{ path: PATH_ARRAY }} />;
}
