"use client";

import { Controller, useFormContext } from "react-hook-form";
import { User } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { FioInput } from "@/shared/components/FioInput";
import { AddressInput } from "@/shared/components/AddressInput";
import { Input } from "@/shared/components/ui/input";
import { SegmentedControl } from "@/shared/components/ui/segmented";
import { maskPhone, maskSnils } from "@/shared/lib/masks";
import type { ApplicantData } from "../types";

export function PersonalDataSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ApplicantData>();
  const e = errors.personal;

  return (
    <FormSection title="Личные данные" icon={<User className="h-5 w-5" />}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Фамилия" required error={e?.lastName?.message}>
          <Controller
            control={control}
            name="personal.lastName"
            render={({ field }) => (
              <FioInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                parts={["SURNAME"]}
                placeholder="Иванов"
              />
            )}
          />
        </Field>

        <Field label="Имя" required error={e?.firstName?.message}>
          <Controller
            control={control}
            name="personal.firstName"
            render={({ field }) => (
              <FioInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                parts={["NAME"]}
                placeholder="Иван"
              />
            )}
          />
        </Field>

        <Field label="Отчество" required error={e?.middleName?.message}>
          <Controller
            control={control}
            name="personal.middleName"
            render={({ field }) => (
              <FioInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                parts={["PATRONYMIC"]}
                placeholder="Иванович"
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Дата рождения" required error={e?.birthDate?.message}>
          <Input type="date" {...register("personal.birthDate")} />
        </Field>

        <Field label="Место рождения" required error={e?.birthPlace?.message}>
          <Controller
            control={control}
            name="personal.birthPlace"
            render={({ field }) => (
              <AddressInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                cityOnly
                placeholder="г. Волгоград"
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Гражданство" required error={e?.citizenship?.message}>
          <Input
            {...register("personal.citizenship")}
            placeholder="Российская Федерация"
          />
        </Field>

        <Field
          label="Тип населённого пункта"
          required
          error={e?.settlementType?.message}
        >
          <Controller
            control={control}
            name="personal.settlementType"
            render={({ field }) => (
              <SegmentedControl
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "city", label: "Город" },
                  { value: "rural", label: "Сельский" },
                ]}
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="СНИЛС" required error={e?.snils?.message}>
          <Controller
            control={control}
            name="personal.snils"
            render={({ field }) => (
              <Input
                value={field.value}
                onBlur={field.onBlur}
                onChange={(ev) => field.onChange(maskSnils(ev.target.value))}
                placeholder="123-456-789 00"
                inputMode="numeric"
              />
            )}
          />
        </Field>

        <Field label="Телефон" required error={e?.phone?.message}>
          <Controller
            control={control}
            name="personal.phone"
            render={({ field }) => (
              <Input
                value={field.value}
                onBlur={field.onBlur}
                onChange={(ev) => field.onChange(maskPhone(ev.target.value))}
                placeholder="+7 (999) 123-45-67"
                inputMode="tel"
              />
            )}
          />
        </Field>

        <Field label="Email" error={e?.email?.message}>
          <Input
            type="email"
            placeholder="ivanov@mail.ru"
            {...register("personal.email")}
          />
        </Field>
      </div>
    </FormSection>
  );
}
