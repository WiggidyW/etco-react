import { VerticalBookend } from "@/components/Bookend";
import { CartInfo } from "./Cart";
import classNames from "classnames";
import { LocaleText, formatPrice } from "../Util";
import { FooterButton } from "@/components/Input/FooterButton";
import { ReactElement } from "react";

export interface FooterProps {
  cartInfo: CartInfo;
  switchViewingCart: () => void;
}
export const Footer = ({
  cartInfo,
  switchViewingCart,
}: FooterProps): ReactElement => (
  <VerticalBookend
    height={undefined}
    className={classNames("flex", "items-center")}
  >
    <span
      className={classNames(
        "flex-grow",
        "basis-0",
        "ml-1",
        "mr-1",
        "text-right"
      )}
    >
      <LocaleText fmt={formatPrice} v={cartInfo.price} />
    </span>
    <FooterButton canClick={cartInfo.quantity > 0} onClick={switchViewingCart}>
      View Cart
    </FooterButton>
    <span className={classNames("flex-grow", "basis-0", "mr-1")} />
  </VerticalBookend>
);
