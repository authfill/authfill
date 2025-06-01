"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "@ui/utils/class";
import { TriangleAlertIcon } from "lucide-react";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export type LabelContainerProps = {
  labelClassName?: string;
  containerClassName?: string;
  innerClassName?: string;
  label?: string;
  name?: string;
  children?: React.ReactNode;
  errors?: {
    type?: string;
    validation?: string;
    code?: string;
    path?: string;
    message?: string;
  }[];
  end?: React.ReactNode;
};

function LabelContainer({
  errors,
  children,
  label,
  labelClassName,
  containerClassName,
  innerClassName,
  name,
  end,
}: LabelContainerProps) {
  return (
    <div className={cn("flex flex-col gap-y-2", containerClassName)}>
      <div className={cn("flex flex-col gap-y-2", innerClassName)}>
        {label || end ? (
          <div className="flex items-end justify-between">
            {label && (
              <Label htmlFor={name} className={cn(labelClassName)}>
                {label}
              </Label>
            )}
            {end}
          </div>
        ) : null}
        {children}
      </div>
      {errors && errors.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {errors.map((error, index) => (
            <div key={index} className="text-xs text-red-500">
              <TriangleAlertIcon className="mr-1.5 inline-block size-4" />
              {error.message}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

LabelContainer.displayName = LabelPrimitive.Root.displayName;

export { Label, LabelContainer };
