import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Workflow Designer",
  description: "Design and test HR workflows with a visual drag-and-drop canvas",
};

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
