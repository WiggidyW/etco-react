import { CurrentCharacterManager } from "@/storage/currentcharacter/manager";
import { ReactElement } from "react";
import {
  ContentFwdPropsLoggedIn,
  PageAdmin,
} from "@/components/Page/PageAdmin";
import { ContentFwdProps } from "@/components/Page/Content";

const PATH = "/admin/configure/auth";

export default function Page(): ReactElement {
  return (
    <PageAdmin path={PATH}>
      {(fwdprops) => <AdminConfigureAuth {...fwdprops} />}
    </PageAdmin>
  );
}

interface AdminConfigureAuthProps extends ContentFwdPropsLoggedIn {}

const AdminConfigureAuth = ({
  currentCharacter,
}: AdminConfigureAuthProps): ReactElement => {
  return <></>;
};
