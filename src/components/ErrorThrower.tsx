"use client";

import { ParsedJSONError } from "@/error/error";
import { ReactNode } from "react";

export interface ErrorThrowerProps {
  error: unknown;
}
export const ErrorThrower = ({ error }: ErrorThrowerProps): ReactNode => {
  throw error;
};
