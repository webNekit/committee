"use client";

import { Controller, useFormContext } from "react-hook-form";
import { GraduationCap } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { Input } from "@/shared/components/ui/input";
import { Combobox } from "@/shared/components/ui/combobox";
import { maskYear } from "@/shared/lib/masks";

const DOCUMENT_TYPES = [
  { value: "attestat", label: "Аттестат" },
  { value: "diplom", label: "Диплом" },
];
import type { ApplicantData } from "../types";

export function EducationSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ApplicantData>();
  const e = errors.previousEducation;

  return (
    <FormSection
      title="Предыдущее образование"
      icon={<GraduationCap className="h-5 w-5" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Название учебного заведения"
          required
          error={e?.institutionName?.message}
          className="sm:col-span-2"
        >
          <Input
            {...register("previousEducation.institutionName")}
            placeholder="МОУ СОШ № 1 г. Волгограда"
          />
        </Field>

        <Field label="Год окончания" required error={e?.finishedYear?.message}>
          <Controller
            control={control}
            name="previousEducation.finishedYear"
            render={({ field }) => (
              <Input
                value={field.value}
                onBlur={field.onBlur}
                onChange={(ev) => field.onChange(maskYear(ev.target.value))}
                placeholder="2026"
                inputMode="numeric"
              />
            )}
          />
        </Field>

        <Field label="Тип документа" required error={e?.documentType?.message}>
          <Controller
            control={control}
            name="previousEducation.documentType"
            render={({ field }) => (
              <Combobox
                options={DOCUMENT_TYPES}
                value={field.value}
                onChange={field.onChange}
                placeholder="Выберите тип"
              />
            )}
          />
        </Field>

        <Field
          label="Серия документа"
          required
          error={e?.documentSeries?.message}
        >
          <Input
            {...register("previousEducation.documentSeries")}
            placeholder="12 АБ"
          />
        </Field>

        <Field
          label="Номер документа"
          required
          error={e?.documentNumber?.message}
        >
          <Input
            {...register("previousEducation.documentNumber")}
            placeholder="0001234"
          />
        </Field>
      </div>
    </FormSection>
  );
}
