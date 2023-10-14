import { permanentRedirect } from "next/navigation";
import { ReactNode } from "react";

const BASE_PATH = "/shop";

export default function Page(): ReactNode {
  return permanentRedirect(BASE_PATH);
}
