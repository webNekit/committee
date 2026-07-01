"use client";

import { useFormContext } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Download,
  Eraser,
  FlaskConical,
  Loader2,
  PackageCheck,
  RotateCcw,
} from "lucide-react";

import type { ApplicantData } from "@/domains/applicant/types";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useDocumentPack, type PackStep } from "./useDocumentPack";

interface DocumentPackButtonProps {
  /** Колбэк после успешной генерации (например, очистка черновика). */
  onGenerated?: () => void;
  /** «Продолжить работу»: сбросить форму и начать нового абитуриента. */
  onContinue?: () => void;
  /** «Очистить поля»: сбросить введённые данные. */
  onClear?: () => void;
  /** «Заполнить тестовыми данными»: для проверки. */
  onFillTest?: () => void;
}

function StepIcon({ status }: { status: PackStep["status"] }) {
  if (status === "done")
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "generating")
    return <Loader2 className="h-4 w-4 animate-spin text-foreground" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

/** Список этапов формирования документов. */
function StepsList({ steps }: { steps: PackStep[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {steps.map((s) => (
        <li
          key={s.id}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            s.status === "done"
              ? "text-foreground"
              : s.status === "generating"
                ? "font-medium text-foreground"
                : "text-muted-foreground",
          )}
        >
          <StepIcon status={s.status} />
          <span className="truncate">{s.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function DocumentPackButton({
  onGenerated,
  onContinue,
  onClear,
  onFillTest,
}: DocumentPackButtonProps) {
  // handleSubmit сам запускает валидацию и показывает ошибки при невалидной форме.
  const { handleSubmit } = useFormContext<ApplicantData>();
  const pack = useDocumentPack();

  const onSubmit = async (data: ApplicantData) => {
    await pack.generate(data);
    onGenerated?.();
  };

  const doneCount = pack.steps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / pack.steps.length) * 100);

  return (
    <div className="space-y-3">
      {pack.status === "idle" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Сформируется заявление, согласия и (при платном обучении) договор —
            в ZIP-архиве.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {onFillTest && (
              <Button
                type="button"
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={onFillTest}
              >
                <FlaskConical className="h-5 w-5" />
                Тестовые данные
              </Button>
            )}
            {onClear && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onClear}
              >
                <Eraser className="h-5 w-5" />
                Очистить поля
              </Button>
            )}
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleSubmit(onSubmit)}
            >
              <PackageCheck className="h-5 w-5" />
              Сформировать комплект
            </Button>
          </div>
        </div>
      )}

      {pack.status === "generating" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Формирование документов…
            </span>
            <span className="text-muted-foreground">
              {doneCount} / {pack.steps.length}
            </span>
          </div>
          <Progress value={progress} />
          <StepsList steps={pack.steps} />
        </div>
      )}

      {pack.status === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {pack.error ?? "Ошибка генерации"}
          </div>
          <Button type="button" variant="outline" onClick={pack.reset}>
            Попробовать снова
          </Button>
        </div>
      )}

      {pack.status === "done" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            Комплект готов — {pack.documents.length} документов. Скачивание
            началось автоматически.
          </div>

          <StepsList steps={pack.steps} />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="lg"
              onClick={() => {
                pack.reset();
                onContinue?.();
              }}
            >
              <RotateCcw className="h-5 w-5" />
              Продолжить работу
            </Button>
            <Button type="button" variant="outline" onClick={pack.download}>
              <Download className="h-5 w-5" />
              Скачать ZIP ещё раз
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
