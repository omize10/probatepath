'use client';

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

interface FormItemContextValue {
  id: string;
  descriptionId: string;
  messageId: string;
}

const FormItemContext = createContext<FormItemContextValue | null>(null);

function useFormItemContext() {
  const context = useContext(FormItemContext);
  if (!context) {
    throw new Error("Form components must be used inside a <FormItem /> component.");
  }
  return context;
}

export const Form = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("space-y-8", className)} {...props} />
  ),
);

Form.displayName = "Form";

export const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();
    const baseId = `form-item-${id}`;

    return (
      <FormItemContext.Provider
        value={{ id: baseId, descriptionId: `${baseId}-description`, messageId: `${baseId}-message` }}
      >
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);

FormItem.displayName = "FormItem";

export const FormLabel = forwardRef<HTMLLabelElement, HTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const { id } = useFormItemContext();
    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn("text-sm font-semibold text-slate-100", className)}
        {...props}
      />
    );
  },
);

FormLabel.displayName = "FormLabel";

export const FormControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { id, descriptionId, messageId } = useFormItemContext();

    const updatedChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) {
        return child;
      }

      const element = child as ReactElement<Record<string, unknown> & { id?: string; "aria-describedby"?: string }>;
      const describedBy =
        [element.props?.["aria-describedby"] as string | undefined, descriptionId, messageId]
          .filter(Boolean)
          .join(" ") || undefined;

      return cloneElement(element, {
        id: element.props.id ?? id,
        "aria-describedby": describedBy,
      });
    });

    return (
      <div ref={ref} className={cn("mt-1", className)} {...props}>
        {updatedChildren}
      </div>
    );
  },
);

FormControl.displayName = "FormControl";

export const FormDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useFormItemContext();
    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn("text-xs text-slate-400", className)}
        {...props}
      />
    );
  },
);

FormDescription.displayName = "FormDescription";

export const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { messageId } = useFormItemContext();
    return (
      <p
        ref={ref}
        id={messageId}
        className={cn("text-xs font-medium text-[#ffb703]", className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);

FormMessage.displayName = "FormMessage";
