"use client";

import { useRef, useState } from "react";
import {
  BookMarked,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";

import {
  addSpecialty,
  exportSpecialtiesJson,
  importSpecialtiesJson,
  removeSpecialty,
  resetSpecialties,
  useSpecialties,
} from "@/domains/applicant/data/specialties";
import { TopBar } from "@/shared/components/TopBar";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { FormSection } from "@/shared/components/FormSection";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";

export default function ReferencePage() {
  const specialties = useSpecialties();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [prof, setProf] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = (type: "ok" | "error", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = () => {
    const res = addSpecialty({ code, name, professionalitet: prof });
    if (res.ok) {
      setCode("");
      setName("");
      setProf(false);
      notify("ok", "Специальность добавлена");
    } else {
      notify("error", res.error ?? "Не удалось добавить");
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportSpecialtiesJson()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "specialties.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const res = importSpecialtiesJson(text);
    if (res.ok) notify("ok", `Импортировано специальностей: ${res.count}`);
    else notify("error", res.error ?? "Ошибка импорта");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dots">
      <TopBar />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Справочная</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управление базой специальностей колледжа. Изменения сохраняются в
            браузере; экспортируйте JSON, чтобы перенести их в файл проекта{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              src/domains/applicant/data/specialties.json
            </code>
            .
          </p>
        </div>

        {message && (
          <div
            className={
              message.type === "ok"
                ? "rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800"
                : "rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800"
            }
          >
            {message.text}
          </div>
        )}

        <FormSection
          title="Специальности"
          description={`Всего: ${specialties.length}`}
          icon={<BookMarked className="h-5 w-5" />}
        >
          {/* Форма добавления */}
          <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto]">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Код (09.02.07)"
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название специальности"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button type="button" onClick={handleAdd}>
              <Plus className="h-4 w-4" /> Добавить
            </Button>
          </div>
          <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={prof}
              onCheckedChange={(c) => setProf(c === true)}
            />
            Реализуется в рамках ФП «Профессионалитет»
          </label>

          {/* Таблица */}
          <div className="mt-5 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Код</th>
                  <th className="px-4 py-2 font-medium">Название</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {specialties.map((s) => (
                  <tr key={s.code} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2 align-top">
                      <Badge variant="secondary" className="font-mono">
                        {s.code}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      {s.name}
                      {s.professionalitet && (
                        <Badge className="ml-2 align-middle">
                          Профессионалитет
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecialty(s.code)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {specialties.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Список пуст. Добавьте специальность или импортируйте JSON.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Действия с файлом */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" /> Экспорт JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Импорт JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetSpecialties();
                notify("ok", "Список сброшен к стандартному");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Сбросить к стандартным
            </Button>
          </div>
        </FormSection>
      </main>

      <SiteFooter />
    </div>
  );
}
