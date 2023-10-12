"use client";

import { ReactNode } from "react";

export interface ErrorThrowerProps {
  error: unknown;
}
export const ErrorThrower = ({ error }: ErrorThrowerProps): ReactNode => {
  throw error;
};
