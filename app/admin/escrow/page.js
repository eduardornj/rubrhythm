import { redirect } from "next/navigation";

export default function EscrowRedirect() {
    redirect("/admin/financeiro");
}
