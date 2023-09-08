"use client";

import { TestInventory } from "@/components/Item/Purchase/Inventory";
import { useCurrentCharacter } from "@/components/Login/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const Test = (): React.ReactElement => {
  const router = useRouter();
  const { character } = useCurrentCharacter("characters-purchase");

  // useEffect(() => {
  //   if (currentCharacter === null) router.push("/purchase/login");
  // }, [currentCharacter]);

  return (
    <main>
      <h1>{character?.name}</h1>
      <a href="/purchase/login">Login</a>
      <TestInventory />
    </main>
  );
};

export default Test;
