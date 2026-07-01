"use client";

import { useState } from "react";
import JSZip from "jszip";

import type { ApplicantData } from "@/domains/applicant/types";
import { generateAllDocuments, planPack } from "@/domains/documents/generator";
import type { GeneratedDocument } from "@/domains/documents/types";
import { formatDate } from "@/domains/documents/utils/date-helpers";

export type PackStatus = "idle" | "generating" | "done" | "error";
export type StepStatus = "pending" | "generating" | "done";

export interface PackStep {
  id: string;
  title: string;
  status: StepStatus;
}

export interface UseDocumentPackResult {
  status: PackStatus;
  steps: PackStep[];
  documents: GeneratedDocument[];
  error: string | null;
  zipBlob: Blob | null;
  zipName: string;
  generate: (data: ApplicantData) => Promise<void>;
  download: () => void;
  reset: () => void;
}

/** Имя архива: Комплект_Фамилия_Имя_ГГГГ-ММ-ДД.zip */
function buildZipName(data: ApplicantData): string {
  const last = data.personal.lastName || "Абитуриент";
  const first = data.personal.firstName || "";
  const date = new Date().toISOString().slice(0, 10); // ГГГГ-ММ-ДД
  return `Комплект_${[last, first].filter(Boolean).join("_")}_${date}.zip`;
}

/** Шаги по плану комплекта для конкретных данных. */
const stepsFor = (data: ApplicantData): PackStep[] =>
  planPack(data).map((p) => ({
    id: p.id,
    title: p.title,
    status: "pending" as StepStatus,
  }));

/** Скачивание Blob под заданным именем. */
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useDocumentPack(): UseDocumentPackResult {
  const [status, setStatus] = useState<PackStatus>("idle");
  const [steps, setSteps] = useState<PackStep[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipName, setZipName] = useState<string>("");

  const generate = async (data: ApplicantData) => {
    setStatus("generating");
    setError(null);
    setSteps(stepsFor(data));

    try {
      // 1. Генерация по одному документу с обновлением статуса этапа.
      const docs = await generateAllDocuments(data, (id, st) => {
        setSteps((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: st } : s)),
        );
      });

      // 2. Упаковка в ZIP.
      const zip = new JSZip();
      for (const doc of docs) {
        zip.file(doc.fileName, doc.content);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const name = buildZipName(data);

      setDocuments(docs);
      setZipBlob(blob);
      setZipName(name);
      setStatus("done");

      // 3. Автоматическое скачивание (мы внутри пользовательского клика).
      downloadBlob(blob, name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось сформировать документы",
      );
      setStatus("error");
    }
  };

  const download = () => {
    if (zipBlob)
      downloadBlob(
        zipBlob,
        zipName || `Комплект_${formatDate(new Date())}.zip`,
      );
  };

  const reset = () => {
    setStatus("idle");
    setSteps([]);
    setDocuments([]);
    setError(null);
    setZipBlob(null);
    setZipName("");
  };

  return {
    status,
    steps,
    documents,
    error,
    zipBlob,
    zipName,
    generate,
    download,
    reset,
  };
}
