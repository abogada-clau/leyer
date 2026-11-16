import { Heading } from "@/components/admin/common";
import { UserInvitation } from "@/components/admin/user-invitation";
import { requireSite } from "@/lib/admin/server";

export default async function Users() {
  await requireSite("sites.manage");

  return (
    <>
      <Heading title="Usuarios" description="Invita a otra persona a administrar el sitio." />
      <UserInvitation />
    </>
  );
}
