import { redirect } from "next/navigation";
import { format } from "date-fns";

export default function DailyPage() {
  const today = format(new Date(), "MMMM-d-yy").toLowerCase();
  redirect(`/daily/beginner/${today}`);
}
