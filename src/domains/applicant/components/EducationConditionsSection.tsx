"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ClipboardList } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { Input } from "@/shared/components/ui/input";
import { SegmentedControl } from "@/shared/components/ui/segmented";
import { Combobox } from "@/shared/components/ui/combobox";
import { Badge } from "@/shared/components/ui/badge";
import { findSpecialtyByName, useSpecialties } from "../data/specialties";
import type { ApplicantData } from "../types";

const EDUCATION_FORMS = [
  { value: "full-time", label: "Очная" },
  { value: "part-time", label: "Заочная" },
  { value: "evening", label: "Вечерняя" },
];

const LANGUAGES = [
  { value: "english", label: "Английский" },
  { value: "german", label: "Немецкий" },
  { value: "french", label: "Французский" },
];

export function EducationConditionsSection() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ApplicantData>();
  const e = errors.educationConditions;
  const specialties = useSpecialties();
  const isProf = useWatch({
    control,
    name: "educationConditions.professionalitet",
  });

  const specialtyOptions = specialties.map((s) => ({
    value: s.name,
    label: `${s.code} — ${s.name}`,
    keywords: s.code,
    badge: s.professionalitet ? "Профессионалитет" : undefined,
  }));

  return (
    <FormSection
      title="Условия обучения"
      icon={<ClipboardList className="h-5 w-5" />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Специальность"
          required
          error={e?.specialty?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name="educationConditions.specialty"
            render={({ field }) => (
              <Combobox
                options={specialtyOptions}
                value={field.value}
                onChange={(name) => {
                  field.onChange(name);
                  const found = findSpecialtyByName(name);
                  setValue(
                    "educationConditions.specialtyCode",
                    found?.code ?? "",
                    { shouldValidate: true },
                  );
                  setValue(
                    "educationConditions.professionalitet",
                    found?.professionalitet ?? false,
                  );
                }}
                placeholder="Выберите специальность"
                searchPlaceholder="Поиск по коду или названию…"
              />
            )}
          />
          {isProf && <Badge className="mt-1.5 w-fit">Профессионалитет</Badge>}
        </Field>

        <Field
          label="Код специальности"
          required
          error={e?.specialtyCode?.message}
        >
          {/* Заполняется автоматически по выбранной специальности. */}
          <Input
            readOnly
            placeholder="09.02.07"
            {...register("educationConditions.specialtyCode")}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Форма обучения"
          required
          error={e?.educationForm?.message}
        >
          <Controller
            control={control}
            name="educationConditions.educationForm"
            render={({ field }) => (
              <Combobox
                options={EDUCATION_FORMS}
                value={field.value}
                onChange={field.onChange}
                placeholder="Форма обучения"
                searchPlaceholder="Поиск…"
              />
            )}
          />
        </Field>

        <Field
          label="Иностранный язык"
          required
          error={e?.foreignLanguage?.message}
        >
          <Controller
            control={control}
            name="educationConditions.foreignLanguage"
            render={({ field }) => (
              <Combobox
                options={LANGUAGES}
                value={field.value}
                onChange={field.onChange}
                placeholder="Язык"
                searchPlaceholder="Поиск…"
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Базовое образование"
          required
          error={e?.baseEducation?.message}
        >
          <Controller
            control={control}
            name="educationConditions.baseEducation"
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "9", label: "9 классов" },
                  { value: "11", label: "11 классов" },
                ]}
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Основание поступления"
          required
          error={e?.fundingBasis?.message}
        >
          <Controller
            control={control}
            name="educationConditions.fundingBasis"
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "budget", label: "Бюджет" },
                  { value: "contract", label: "Договор (платно)" },
                ]}
              />
            )}
          />
        </Field>

        <Field
          label="Дата подачи заявления"
          required
          error={e?.applicationDate?.message}
        >
          <Input
            type="date"
            {...register("educationConditions.applicationDate")}
          />
        </Field>
      </div>
    </FormSection>
  );
}
