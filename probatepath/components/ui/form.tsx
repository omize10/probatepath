import * as React from "react";

import { cn, mergeRefs } from "@/lib/utils";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ className, ...props }, ref) => (
  <form ref={ref} className={cn("space-y-6", className)} {...props} />
));
Form.displayName = "Form";

type FormFieldContextValue = {
  name: string;
  formItemId: string;
  formFieldId: string;
  formDescriptionId: string;
  formMessageId: string;
  description?: React.ReactNode;
  message?: React.ReactNode;
  error?: React.ReactNode;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export interface FormFieldProps {
  name: string;
  id?: string;
  description?: React.ReactNode;
  message?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  id,
  description,
  message,
  error,
  children,
}) => {
  const generatedId = React.useId();
  const formFieldId = id ?? generatedId;
  const value = React.useMemo<FormFieldContextValue>(
    () => ({
      name,
      formItemId: `${formFieldId}-item`,
      formFieldId,
      formDescriptionId: `${formFieldId}-description`,
      formMessageId: `${formFieldId}-message`,
      description,
      message,
      error,
    }),
    [description, error, formFieldId, message, name],
  );

  return <FormFieldContext.Provider value={value}>{children}</FormFieldContext.Provider>;
};

export function useFormField(): FormFieldContextValue {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within a <FormField /> component");
  }

  return context;
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { formItemId } = useFormField();
    return <div ref={ref} id={formItemId} className={cn("space-y-2", className)} {...props} />;
  },
);
FormItem.displayName = "FormItem";

interface FormControlProps {
  children: React.ReactElement;
}

const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  ({ children }, ref) => {
    const { formFieldId, formDescriptionId, formMessageId, error } = useFormField();

    if (!React.isValidElement(children)) {
      return children;
    }

    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props ?? {};
    const describedBy = [childProps["aria-describedby"], formDescriptionId, error ? formMessageId : null]
      .filter(Boolean)
      .join(" ")
      .trim();

    const mergedRef = mergeRefs(ref as any, (child as any).ref ?? null);

    return React.cloneElement(child, {
      id: (childProps.id as string | undefined) ?? formFieldId,
      "aria-describedby": describedBy || undefined,
      "aria-invalid": error ? true : childProps["aria-invalid"],
      ref: mergedRef,
    } as Record<string, unknown>);
  },
);
FormControl.displayName = "FormControl";

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const { formFieldId } = useFormField();
    return (
      <label
        ref={ref}
        htmlFor={props.htmlFor ?? formFieldId}
        className={cn("text-sm font-medium leading-none", className)}
        {...props}
      />
    );
  },
);
FormLabel.displayName = "FormLabel";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, role, ...props }, ref) => {
    const { formMessageId, error, message } = useFormField();
    const body = children ?? error ?? message;

    if (!body) {
      return null;
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn(
          "text-sm font-medium text-destructive",
          className,
        )}
        role={error ? "alert" : role}
        {...props}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
