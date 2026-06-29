"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, UserCircle2, Users } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { FioInput } from "@/shared/components/FioInput";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/ui/combobox";
import { maskPhone } from "@/shared/lib/masks";
import type { ApplicantData } from "../types";

const NOT_WORKING = "Не работает";

const ROLE_OPTIONS = [
  { value: "mother", label: "Мать" },
  { value: "father", label: "Отец" },
  { value: "guardian", label: "Опекун" },
];

export function ParentsSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ApplicantData>();
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
        {fields.map((item, index) => {
          const e = errors.parents?.[index];
          return (
            <div
              key={item.id}
              className="overflow-visible rounded-xl border border-border bg-card"
            >
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
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
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
                        onChange={(ev) =>
                          field.onChange(maskPhone(ev.target.value))
                        }
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

                <Field
                  label="Место работы"
                  error={e?.workplace?.message}
                  className="sm:col-span-2"
                >
                  <Controller
                    control={control}
                    name={`parents.${index}.workplace`}
                    render={({ field }) => {
                      const notWorking = field.value === NOT_WORKING;
                      return (
                        <div className="space-y-2">
                          <Input
                            value={notWorking ? "" : (field.value ?? "")}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={notWorking}
                            placeholder={
                              notWorking
                                ? "Не работает"
                                : "ООО «Ромашка», бухгалтер"
                            }
                          />
                          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                              checked={notWorking}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  checked === true ? NOT_WORKING : "",
                                )
                              }
                            />
                            Не работает
                          </label>
                        </div>
                      );
                    }}
                  />
                </Field>
              </div>
            </div>
          );
        })}

        {/* Кнопка добавления — пунктирная карточка */}
        {fields.length < 2 && (
          <button
            type="button"
            onClick={() =>
              append({
                role: "father",
                fullName: "",
                phone: "",
                workplace: "",
              })
            }
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
