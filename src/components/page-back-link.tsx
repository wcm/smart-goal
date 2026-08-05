import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="page-back-link"><ArrowLeft size={16} />{children}</Link>;
}
