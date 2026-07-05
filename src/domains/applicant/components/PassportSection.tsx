"use client";

import { Controller, useFormContext } from "react-hook-form";
import { BookUser } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { AddressInput } from "@/shared/components/AddressInput";
import { Input } from "@/shared/components/ui/input";
import { maskPassportNumber, maskPassportSeries } from "@/shared/lib/masks";
import type { ApplicantData } from "../types";

export function PassportSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ApplicantData>();
  const e = errors.passport;

  return (
    <FormSection
      title="Паспортные данные и адрес"
      icon={<BookUser className="h-5 w-5" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Серия" required error={e?.series?.message}>
          <Controller
            control={control}
            name="passport.series"
            render={({ field }) => (
              <Input
                value={field.value}
                onBlur={field.onBlur}
                onChange={(ev) =>
                  field.onChange(maskPassportSeries(ev.target.value))
                }
                placeholder="1234"
                inputMode="numeric"
              />
            )}
          />
        </Field>

        <Field label="Номер" required error={e?.number?.message}>
          <Controller
            control={control}
            name="passport.number"
            render={({ field }) => (
              <Input
                value={field.value}
                onBlur={field.onBlur}
                onChange={(ev) =>
                  field.onChange(maskPassportNumber(ev.target.value))
                }
                placeholder="567890"
                inputMode="numeric"
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Кем выдан" required error={e?.issuedBy?.message}>
          <Controller
            control={control}
            name="passport.issuedBy"
            render={({ field }) => (
              <AddressInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="ГУ МВД России по Волгоградской области"
              />
            )}
          />
        </Field>

        <Field label="Дата выдачи" required error={e?.issuedDate?.message}>
          <Input type="date" {...register("passport.issuedDate")} />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Адрес регистрации"
          required
          error={e?.registrationAddress?.message}
        >
          <Controller
            control={control}
            name="passport.registrationAddress"
            render={({ field }) => (
              <AddressInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="г. Волгоград, ул. ..., д. ..., кв. ..."
              />
            )}
          />
        </Field>
      </div>
    </FormSection>
  );
}
