import { PropsWithChildren, ReactElement, ReactNode } from "react";
import classNames from "classnames";
import { VerticalBookend } from "./Bookend";
import { CharacterPortrait } from "./Character/Portrait";
import Link from "next/link";
import { Character, ICharacter } from "@/browser/character";
import LoginImagePNG from "@/../public/eve-sso-login-black-large.png";

export interface NavBarProps {
  path: string;
  character?: Character | ICharacter | null;
}
export const NavBar = ({ path, character }: NavBarProps): ReactElement => (
  <VerticalBookend
    height={undefined}
    className={classNames("flex", "items-center")}
  >
    <div className={classNames("ml-2", "pt-1", "pb-1")}>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/buyback">Buyback</NavLink>
      <NavLink href="/shop">Shop</NavLink>
      <NavLink href="/history" disabled={!character}>
        History
      </NavLink>
      {character?.admin && (
        <NavDropdown
          items={[
            <NavLink href="/admin/login" key="l" nested>
              Login
            </NavLink>,
            <NavLink href="/admin/queue/buyback-contracts" key="bcq" nested>
              Buyback Contract Queue
            </NavLink>,
            <NavLink href="/admin/queue/shop-contracts" key="scq" nested>
              Shop Contract Queue
            </NavLink>,
            <NavLink href="/admin/queue/shop-purchase" key="spq" nested>
              Shop Purchase Queue
            </NavLink>,
            <NavLink href="/admin/configure/markets" key="cm" nested>
              Configure Markets
            </NavLink>,
            <NavLink href="/admin/configure/shop-type-pricing" key="csi" nested>
              Configure Shop Items
            </NavLink>,
            <NavLink href="/admin/configure/shop-locations" key="csl" nested>
              Configure Shop Locations
            </NavLink>,
            <NavLink
              href="/admin/configure/buyback-type-pricing"
              key="cbi"
              nested
            >
              Configure Buyback Items
            </NavLink>,
            <NavLink href="/admin/configure/buyback-systems" key="bs" nested>
              Configure Buyback Systems
            </NavLink>,
            <NavLink href="/admin/configure/user-auth" key="cua" nested>
              Configure User Auth
            </NavLink>,
            <NavLink href="/admin/configure/admin-auth" key="caa" nested>
              Configure Admin Auth
            </NavLink>,
          ]}
        >
          <NavLink href="/admin">Admin</NavLink>
        </NavDropdown>
      )}
    </div>
    <div className={classNames("flex-grow")}></div>
    <div className={classNames("flex-shrink-0", "mr-2")}>
      <LoginImage path={path} character={character} />
    </div>
    {/* </div> */}
  </VerticalBookend>
);

const LoginImage = ({ path, character }: NavBarProps): ReactElement => (
  <Link href={`${path === "/" ? "" : path}/login`}>
    {character === null || character === undefined ? (
      <img
        src={LoginImagePNG.src}
        alt="Login"
        width={161}
        height={45}
        className={classNames("pt-1", "pb-1")}
      />
    ) : (
      <CharacterPortrait character={character} size="md" rounded />
    )}
  </Link>
);

interface NavLinkProps extends PropsWithChildren {
  className?: string;
  href: string;
  nested?: boolean;
  disabled?: boolean;
}
const NavLink = ({
  className,
  href,
  nested,
  disabled,
  children,
}: NavLinkProps): ReactElement => (
  <Link
    href={href}
    className={classNames(
      "inline-block",
      "whitespace-nowrap",
      "font-bold",
      "hover:text-light-blue-base",
      { [classNames("text-xl", "mr-3")]: !nested },
      {
        [classNames(
          "brightness-50",
          "pointer-events-none",
          "cursor-not-allowed"
        )]: disabled,
      },
      className
    )}
  >
    {children}
  </Link>
);

interface NavDropdownProps extends PropsWithChildren {
  className?: string;
  items: ReactNode[];
}
const NavDropdown = ({
  className: topClassName,
  items,
  children,
}: NavDropdownProps): ReactElement => (
  <div
    className={classNames("group", "inline-block", "relative", topClassName)}
  >
    {children}
    <ul
      className={classNames("absolute", "hidden", "group-hover:block", "z-50")}
    >
      {items.map((item, i) => (
        <li
          key={i}
          className={classNames(
            "px-2",
            "bg-primary-base",
            "first:border-t",
            "border-l",
            "border-r",
            "last:border-b",
            "border-primary-border"
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);
