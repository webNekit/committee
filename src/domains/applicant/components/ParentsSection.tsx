"use client";

import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Plus, Trash2, UserCircle2, Users } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { FioInput } from "@/shared/components/FioInput";
import { AddressInput } from "@/shared/components/AddressInput";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/ui/combobox";
import {
  maskPassportNumber,
  maskPassportSeries,
  maskPhone,
  maskSnils,
} from "@/shared/lib/masks";
import type { ApplicantData } from "../types";

const ROLE_OPTIONS = [
  { value: "mother", label: "Мать" },
  { value: "father", label: "Отец" },
  { value: "guardian", label: "Опекун" },
];

/** Одна карточка представителя. Отдельный компонент — чтобы использовать хуки. */
function ParentCard({
  index,
  canRemove,
  onRemove,
}: {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ApplicantData>();
  const e = errors.parents?.[index];
  const isCustomer = useWatch({
    control,
    name: `parents.${index}.isContractCustomer`,
  });

  return (
    <div className="rounded-xl border border-l-4 border-l-primary border-border bg-card">
      {/* Шапка карточки */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {index + 1}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            Представитель
          </span>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Поля */}
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Роль" required error={e?.role?.message}>
          <Controller
            control={control}
            name={`parents.${index}.role`}
            render={({ field }) => (
              <Combobox
                options={ROLE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                placeholder="Выберите роль"
              />
            )}
          />
        </Field>

        <Field label="Телефон" required error={e?.phone?.message}>
          <Controller
            control={control}
            name={`parents.${index}.phone`}
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

        <Field
          label="ФИО"
          required
          error={e?.fullName?.message}
          className="sm:col-span-2"
        >
          <Controller
            control={control}
            name={`parents.${index}.fullName`}
            render={({ field }) => (
              <FioInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Иванова Мария Петровна"
              />
            )}
          />
        </Field>

        {/* Заказчик по договору */}
        <div className="sm:col-span-2">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
            <Controller
              control={control}
              name={`parents.${index}.isContractCustomer`}
              render={({ field }) => (
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              )}
            />
            Заказчик по договору (заполнить данные представителя)
          </label>
        </div>
      </div>

      {/* Полные данные представителя — только если он Заказчик */}
      {isCustomer && (
        <div className="grid gap-4 border-t border-border bg-secondary/30 p-4 sm:grid-cols-2">
          <Field label="Дата рождения" error={e?.birthDate?.message}>
            <Controller
              control={control}
              name={`parents.${index}.birthDate`}
              render={({ field }) => (
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field label="Место рождения" error={e?.birthPlace?.message}>
            <Controller
              control={control}
              name={`parents.${index}.birthPlace`}
              render={({ field }) => (
                <AddressInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  cityOnly
                  placeholder="г. Волгоград"
                />
              )}
            />
          </Field>

          <Field label="СНИЛС" error={e?.snils?.message}>
            <Controller
              control={control}
              name={`parents.${index}.snils`}
              render={({ field }) => (
                <Input
                  value={field.value ?? ""}
                  onChange={(ev) => field.onChange(maskSnils(ev.target.value))}
                  placeholder="123-456-789 00"
                  inputMode="numeric"
                />
              )}
            />
          </Field>

          <Field label="Email" error={e?.email?.message}>
            <Controller
              control={control}
              name={`parents.${index}.email`}
              render={({ field }) => (
                <Input
                  type="email"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="mail@mail.ru"
                />
              )}
            />
          </Field>

          <Field label="Серия паспорта" error={e?.passportSeries?.message}>
            <Controller
              control={control}
              name={`parents.${index}.passportSeries`}
              render={({ field }) => (
                <Input
                  value={field.value ?? ""}
                  onChange={(ev) =>
                    field.onChange(maskPassportSeries(ev.target.value))
                  }
                  placeholder="1234"
                  inputMode="numeric"
                />
              )}
            />
          </Field>

          <Field label="Номер паспорта" error={e?.passportNumber?.message}>
            <Controller
              control={control}
              name={`parents.${index}.passportNumber`}
              render={({ field }) => (
                <Input
                  value={field.value ?? ""}
                  onChange={(ev) =>
                    field.onChange(maskPassportNumber(ev.target.value))
                  }
                  placeholder="567890"
                  inputMode="numeric"
                />
              )}
            />
          </Field>

          <Field label="Кем выдан" error={e?.passportIssuedBy?.message}>
            <Controller
              control={control}
              name={`parents.${index}.passportIssuedBy`}
              render={({ field }) => (
                <AddressInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="ГУ МВД России по ..."
                />
              )}
            />
          </Field>

          <Field label="Дата выдачи" error={e?.passportIssuedDate?.message}>
            <Controller
              control={control}
              name={`parents.${index}.passportIssuedDate`}
              render={({ field }) => (
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field
            label="Адрес регистрации"
            error={e?.registrationAddress?.message}
            className="sm:col-span-2"
          >
            <Controller
              control={control}
              name={`parents.${index}.registrationAddress`}
              render={({ field }) => (
                <AddressInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="г. Волгоград, ул. ..., д. ..."
                />
              )}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export function ParentsSection() {
  const { control } = useFormContext<ApplicantData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "parents",
  });

  return (
    <FormSection
      title="Сведения о родителях / представителях"
      description="До двух записей"
      icon={<Users className="h-5 w-5" />}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {fields.map((item, index) => (
          <ParentCard
            key={item.id}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}

        {fields.length < 2 && (
          <button
            type="button"
            onClick={() => append({ role: "father", fullName: "", phone: "" })}
            className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:bg-accent/50 hover:text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-current">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Добавить представителя</span>
          </button>
        )}
      </div>
    </FormSection>
  );
}
