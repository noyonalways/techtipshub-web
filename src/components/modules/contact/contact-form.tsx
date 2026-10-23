"use client";

import { useEffect, useRef, useState } from "react";
import THInput from "@/components/form/th-input";
import THTextarea from "@/components/form/th-textarea";
import { contactFormValidationSchema } from "@/schemas";
import { submitContactForm } from "@/services/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { BiCheckCircle, BiErrorCircle } from "react-icons/bi";

type TStatus = { type: "success" | "error"; message: string } | null;

const ContactForm = () => {
  const methods = useForm({
    resolver: zodResolver(contactFormValidationSchema),
  });
  const {
    reset,
    setFocus,
    formState: { isSubmitting, errors },
  } = methods;
  const [status, setStatus] = useState<TStatus>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);

  // On a failed send, put the keyboard back at the first problem, or on the
  // explanation when the problem was not one specific field.
  useEffect(() => {
    if (status?.type !== "error") return;
    const firstInvalid = ["firstName", "lastName", "email", "subject", "message"].find(
      (name) => name in errors,
    );
    if (firstInvalid) {
      setFocus(firstInvalid as "firstName");
    } else {
      feedbackRef.current?.focus();
    }
  }, [status, errors, setFocus]);

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
      // Swap the form for the receipt, keeping focus on what just happened.
      requestAnimationFrame(() => sentRef.current?.focus());
    }

    setStatus({
      type: result.success ? "success" : "error",
      message: result.message,
    });
  };

  const onSubmit = methods.handleSubmit(handleSubmit);

  if (status?.type === "success") {
    return (
      <div
        ref={sentRef}
        id="message-sent"
        tabIndex={-1}
        role="status"
        className="scroll-mt-24 rounded-lg border border-success/40 bg-success/10 p-5 outline-none focus-visible:ring-2 focus-visible:ring-success sm:p-6"
      >
        <p className="flex items-center gap-2 font-semibold text-success">
          <BiCheckCircle aria-hidden className="size-5 shrink-0" />
          Message sent
        </p>
        <p className="mt-2 text-sm leading-relaxed text-default-600">
          {status.message}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button
            variant="bordered"
            radius="lg"
            onPress={() => setStatus(null)}
            className="font-semibold"
          >
            Send another message
          </Button>
          <p className="text-sm text-default-600">
            Replies come from the address you entered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <THInput
              name="firstName"
              label="First name"
              placeholder="Your first name"
              variant="bordered"
              isRequired
            />
            <THInput
              name="lastName"
              label="Last name"
              placeholder="Your last name"
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
            variant="bordered"
            isRequired
          />
          <THTextarea
            name="message"
            label="Message"
            placeholder="What happened, what you expected, and any links that help."
            variant="bordered"
            minRows={5}
            isRequired
          />

          {status?.type === "error" && (
            <p
              ref={feedbackRef}
              tabIndex={-1}
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-3 text-sm text-danger outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <BiErrorCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {status.message}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              color="primary"
              radius="lg"
              className="font-semibold"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send message"}
            </Button>
            <p className="text-xs leading-relaxed text-default-600">
              Leave out passwords and API keys.
            </p>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
