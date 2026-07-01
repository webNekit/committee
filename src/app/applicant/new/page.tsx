"use client";

import { FormProvider } from "react-hook-form";
import {
  BookUser,
  ClipboardList,
  GraduationCap,
  Info,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import {
  emptyApplicant,
  sampleApplicant,
  useApplicantForm,
} from "@/domains/applicant/hooks/useApplicantForm";
import { EducationConditionsSection } from "@/domains/applicant/components/EducationConditionsSection";
import { PersonalDataSection } from "@/domains/applicant/components/PersonalDataSection";
import { PassportSection } from "@/domains/applicant/components/PassportSection";
import { EducationSection } from "@/domains/applicant/components/EducationSection";
import { ParentsSection } from "@/domains/applicant/components/ParentsSection";
import { DocumentPackButton } from "@/features/document-pack/DocumentPackButton";
import { TopBar } from "@/shared/components/TopBar";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { FormSidebar } from "@/shared/components/FormSidebar";
import { Progress } from "@/shared/components/ui/progress";
import { isSuggestionsEnabled } from "@/domains/suggestions/api";

const SECTIONS = [
  { id: "conditions", label: "Условия обучения", icon: ClipboardList },
  { id: "personal", label: "Личные данные", icon: User },
  { id: "passport", label: "Паспорт и адреса", icon: BookUser },
  { id: "education", label: "Предыдущее образование", icon: GraduationCap },
  { id: "parents", label: "Родители / представители", icon: Users },
];

export default function NewApplicantPage() {
  const { form, completion, sectionStatus, clearDraft } = useApplicantForm();
  const suggestionsOff = !isSuggestionsEnabled();

  // «Продолжить работу»: очистить форму и черновик, начать нового абитуриента.
  const handleContinue = () => {
    form.reset(emptyApplicant());
    clearDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // «Очистить поля»: сбросить введённые данные (с подтверждением).
  const handleClear = () => {
    if (window.confirm("Очистить все поля? Введённые данные будут удалены.")) {
      form.reset(emptyApplicant());
      clearDraft();
    }
  };

  // «Заполнить тестовыми данными»: для проверки генерации документов.
  const handleFillTest = () => form.reset(sampleApplicant());

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col bg-background bg-dots">
        <TopBar />

        <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
          <FormSidebar
            title="Анкета абитуриента"
            subtitle="Приём 2026"
            sections={SECTIONS}
            status={sectionStatus}
          />

          <main className="min-w-0 flex-1 pb-44">
            {/* Заголовок */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                Автоматизация документооборота
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                Новый абитуриент
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Заполните данные один раз — система сформирует комплект из 6
                документов в формате DOCX и упакует их в архив для скачивания.
              </p>
            </div>

            {/* Уведомление об отключённых подсказках */}
            {suggestionsOff && (
              <div className="mb-6 flex items-start gap-1.5 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Подсказки адресов и ФИО отключены: не задан токен Dadata
                (NEXT_PUBLIC_DADATA_TOKEN). Форма доступна без подсказок.
              </div>
            )}

            {/* Секции формы */}
            <div className="space-y-6">
              <div id="conditions" className="scroll-mt-24">
                <EducationConditionsSection />
              </div>
              <div id="personal" className="scroll-mt-24">
                <PersonalDataSection />
              </div>
              <div id="passport" className="scroll-mt-24">
                <PassportSection />
              </div>
              <div id="education" className="scroll-mt-24">
                <EducationSection />
              </div>
              <div id="parents" className="scroll-mt-24">
                <ParentsSection />
              </div>
            </div>
          </main>
        </div>

        {/* Sticky-панель действий */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {/* Индикатор заполнения формы */}
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Заполнено полей</span>
                <span className="font-semibold text-foreground">
                  {completion}%
                </span>
              </div>
              <Progress value={completion} className="h-2" />
            </div>
            <DocumentPackButton
              onGenerated={clearDraft}
              onContinue={handleContinue}
              onClear={handleClear}
              onFillTest={handleFillTest}
            />
          </div>
        </div>

        <SiteFooter />
      </div>
    </FormProvider>
  );
}
