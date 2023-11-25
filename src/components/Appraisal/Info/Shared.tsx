import { Entity } from "@/browser/entity";
import { LoginCharacterPortrait } from "@/components/Character/Portrait";
import classNames from "classnames";
import { PropsWithChildren, ReactElement } from "react";

export interface InfoTableProps extends PropsWithChildren {
  className?: string;
}
export const InfoTable = ({
  className,
  children,
}: InfoTableProps): ReactElement => (
  <table
    className={classNames("bg-primary-base", "whitespace-nowrap", className)}
  >
    <tbody>{children}</tbody>
  </table>
);

export interface InfoRowProps extends PropsWithChildren {
  label: string;
}
export const InfoRow = ({ label, children }: InfoRowProps): ReactElement => (
  <tr>
    <td className={classNames("text-sm", "text-right", "align-text-top")}>
      {label}
    </td>
    <td className={classNames("pl-2")}>{children}</td>
  </tr>
);

export interface PortraitRowProps {
  entity: Entity;
}
export const PortraitRow = ({ entity }: PortraitRowProps): ReactElement => (
  <tr>
    <td colSpan={2}>
      <div className={classNames("flex", "justify-center")}>
        <LoginCharacterPortrait
          character={entity}
          size={"xl"}
          loginEffect={false}
          nameBarMinFit
        />
      </div>
    </td>
  </tr>
);

export interface TitleRowProps extends PropsWithChildren {}
export const TitleRow = ({ children }: TitleRowProps): ReactElement => (
  <tr>
    <td colSpan={2} className={classNames("text-center", "text-lg")}>
      {children}
    </td>
  </tr>
);
