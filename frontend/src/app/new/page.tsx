import Link from "next/link";
import { PlanForm } from "@/components/PlanForm";
import { Button, SectionTitle } from "@/components/ui";

export default function NewPlanPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <SectionTitle
            title="Novo Plano"
            subtitle="Crie, anexe materiais (PDF/imagem), processe e gere com Claude."
          />

          <Link href="/dashboard">
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>

        <div className="mt-8">
          <PlanForm />
        </div>
      </div>
    </main>
  );
}
