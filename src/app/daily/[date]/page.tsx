import { use } from "react";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    date: string;
  }>;
};

export default function DateRedirect({ params }: Props) {
  const { date } = use(params);
  redirect(`/daily/${date}/beginner`);
}
