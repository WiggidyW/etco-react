import LoginPage from "../../[...path]/page";
import { ReactNode } from "react";

export default function Page(): ReactNode {
  return <LoginPage params={{ path: ["shop", "login"] }} />;
}
