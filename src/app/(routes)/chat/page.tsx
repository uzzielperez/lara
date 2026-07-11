import { redirect } from "next/navigation";

/** Unified chat lives on the dashboard. */
export default function ChatPage() {
  redirect("/profile");
}
