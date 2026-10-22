"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import THTextarea from "@/components/form/th-textarea";
import { contactFormValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { FieldValues } from "react-hook-form";
import { BsArrowRight } from "react-icons/bs";


interface IProps {}

const ContactForm = ({}: IProps) => {
  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };
  return (
    <THForm onSubmit={onSubmit} resolver={zodResolver(contactFormValidationSchema)}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <THInput
            name="firstName"
            label="First name"
            placeholder="Enter your first name"
            variant="bordered"
          />
          <THInput
            name="lastName"
            label="Last name"
            placeholder="Enter your last name"
            variant="bordered"
          />
        </div>
        <THInput
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email address"
          variant="bordered"
        />
        <THInput
          name="subject"
          label="Subject"
          placeholder="What is your inquiry about?"
          variant="bordered"
        />
        <THTextarea
          name="message"
          label="Message"
          placeholder="Please provide details about your inquiry"
          variant="bordered"
          minRows={4}
        />
        <Button
          type="submit"
          color="primary"
          radius="sm"
          endContent={<BsArrowRight size={16} />}
        >
          Send Message
        </Button>
      </div>
    </THForm>
  );
};

export default ContactForm;
