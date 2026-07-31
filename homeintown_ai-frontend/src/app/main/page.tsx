import { redirect } from "next/navigation";

// /main route redirects to home page
export default function MainPage() {
  redirect("/");
}
