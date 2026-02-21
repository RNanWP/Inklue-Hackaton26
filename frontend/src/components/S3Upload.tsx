"use client";

import { api } from "@/lib/api";
import { Button, Card, CardContent } from "@/components/ui";

const TEACHER_ID = "demo-teacher";

export function S3Upload({
  onUploaded,
}: {
  onUploaded: (fileKey: string) => void;
}) {
  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const presign = await api.post("/uploads/presign", {
      teacherId: TEACHER_ID,
      contentType: file.type || "application/octet-stream",
      originalName: file.name,
    });

    const { uploadUrl, key } = presign.data as {
      uploadUrl: string;
      key: string;
    };

    // faz upload no S3
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    onUploaded(key);
    e.target.value = "";
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Anexar material</p>
          <p className="text-sm text-[rgb(var(--muted))]">
            PDF, imagem ou documento (upload direto no S3)
          </p>
        </div>

        <label>
          <input className="hidden" type="file" onChange={handlePick} />
          <Button type="button" variant="ghost">
            Upload
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}
