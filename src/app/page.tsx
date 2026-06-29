import { redirect } from "next/navigation";

export default function Home() {
  // Главная сразу ведёт к форме нового абитуриента.
  redirect("/applicant/new");
}
