import LoginPage from "@/app/[...path]/page";
import { ReactNode } from "react";

const PATH_ARRAY = ["shop", "inventory", "login"];

export default function Page(): ReactNode {
  return <LoginPage params={{ path: PATH_ARRAY }} />;
}
