"use client";

import { useState } from "react";
import THInput from "@/components/form/th-input";
import THTextarea from "@/components/form/th-textarea";
import { contactFormValidationSchema } from "@/schemas";
import { submitContactForm } from "@/services/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { BiCheckCircle, BiErrorCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

type TStatus = { type: "success" | "error"; message: string } | null;

const ContactForm = () => {
  const methods = useForm({
    resolver: zodResolver(contactFormValidationSchema),
  });
  const {
    reset,
    formState: { isSubmitting },
  } = methods;
  const [status, setStatus] = useState<TStatus>(null);

  const handleSubmit = async (data: FieldValues) => {
    setStatus(null);

    const result = await submitContactForm({
      firstName: String(data.firstName ?? ""),
      lastName: String(data.lastName ?? ""),
      email: String(data.email ?? ""),
      subject: String(data.subject ?? ""),
      message: String(data.message ?? ""),
    });

    if (result.success) {
      // Clear the form only once the message is genuinely accepted.
      reset();
    }

    setStatus({
      type: result.success ? "success" : "error",
      message: result.message,
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <THInput
              name="firstName"
              label="First name"
              placeholder="Ada"
              variant="bordered"
              isRequired
            />
            <THInput
              name="lastName"
              label="Last name"
              placeholder="Lovelace"
              variant="bordered"
              isRequired
            />
          </div>
          <THInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            variant="bordered"
            isRequired
          />
          <THInput
            name="subject"
            label="Subject"
            placeholder="What is this about?"
            variant="bordered"
            isRequired
          />
          <THTextarea
            name="message"
            label="Message"
            placeholder="Tell us what you need — the more detail, the better we can help."
            variant="bordered"
            minRows={5}
            isRequired
          />

          {status && (
            <p
              role="status"
              aria-live="polite"
              className={`flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm ${
                status.type === "success"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-danger/40 bg-danger/10 text-danger"
              }`}
            >
              {status.type === "success" ? (
                <BiCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              ) : (
                <BiErrorCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              )}
              {status.message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              color="primary"
              radius="lg"
              className="font-semibold"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              endContent={!isSubmitting && <BsArrowRight size={16} aria-hidden />}
            >
              {isSubmitting ? "Sending…" : "Send message"}
            </Button>
            <p className="text-xs text-default-500">
              Redacted examples are fine — never paste credentials.
            </p>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
