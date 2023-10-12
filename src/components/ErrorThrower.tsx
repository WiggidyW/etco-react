"use client";

import { ParsedJSONError } from "@/error/error";
import { ReactNode } from "react";

export interface ErrorThrowerProps {
  error: unknown;
}
export const ErrorThrower = ({ error }: ErrorThrowerProps): ReactNode => {
  throw error;
};

export interface ParsedErrorThrowerProps {
  error: ParsedJSONError;
}
export const ParsedErrorThrower = ({
  error,
}: ParsedErrorThrowerProps): ReactNode => {
  throw error.toErrorMinified().message;
};
