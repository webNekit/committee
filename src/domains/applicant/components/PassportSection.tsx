"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { BookUser } from "lucide-react";

import { Field, FormSection } from "@/shared/components/FormSection";
import { AddressInput } from "@/shared/components/AddressInput";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  maskDivisionCode,
  maskPassportNumber,
  maskPassportSeries,
} from "@/shared/lib/masks";
import type { ApplicantData } from "../types";

export function PassportSection() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ApplicantData>();
  const e = errors.passport;
  const sameAsRegistration = useWatch({
    control,
    name: "passport.sameAsRegistration",
  });

  return (
    <FormSection
      title="Паспортные данные и адреса"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дата выдачи" required error={e?.issuedDate?.message}>
            <Input type="date" {...register("passport.issuedDate")} />
          </Field>
          <Field
            label="Код подразделения"
            required
            error={e?.divisionCode?.message}
          >
            <Controller
              control={control}
              name="passport.divisionCode"
              render={({ field }) => (
                <Input
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(ev) =>
                    field.onChange(maskDivisionCode(ev.target.value))
                  }
                  placeholder="340-001"
                  inputMode="numeric"
                />
              )}
            />
          </Field>
        </div>
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

      <label className="mt-4 flex items-center gap-2 text-sm">
        <Controller
          control={control}
          name="passport.sameAsRegistration"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                const value = checked === true;
                field.onChange(value);
                if (value) setValue("passport.actualAddress", "");
              }}
            />
          )}
        />
        Фактический адрес совпадает с регистрацией
      </label>

      {!sameAsRegistration && (
        <div className="mt-4">
          <Field
            label="Фактический адрес"
            required
            error={e?.actualAddress?.message}
          >
            <Controller
              control={control}
              name="passport.actualAddress"
              render={({ field }) => (
                <AddressInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="г. ..., ул. ..."
                />
              )}
            />
          </Field>
        </div>
      )}
    </FormSection>
  );
}
