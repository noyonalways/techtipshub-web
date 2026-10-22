"use client";

import THDatePicker from "@/components/form/th-date-picker";
import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import THSelect from "@/components/form/th-select";
import Loading from "@/components/loading";
import { useUserRegister } from "@/hooks/auth.hook";
import { signUpValidationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";

const options = [
  {
    key: "Male",
    label: "Male",
  },
  {
    key: "Female",
    label: "Female",
  },
  {
    key: "Other",
    label: "Other",
  },
];

interface IProps {}

const SignUpForm: React.FC<IProps> = () => {
  const [isPassword, setIsPassword] = useState(true);
  const router = useRouter();
  const { mutate: registerUser, isPending, data } = useUserRegister();

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData();

    const registerData = {
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: data.password,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
    };

    formData.append("data", JSON.stringify(registerData));

    if (data.image.length > 0) {
      formData.append("image", data.image[0]);
    }

    registerUser(formData);
  };

  useEffect(() => {
    if (!isPending && data?.success) {
      router.push("/login");
    }
  }, [isPending, data, router]);

  return (
    <Suspense>
      <THForm
        onSubmit={onSubmit}
        resolver={zodResolver(signUpValidationSchema)}
        key={JSON.stringify("default_key")}
      >
        <div className="space-y-2 mb-6">
          <THInput
            variant="faded"
            radius="sm"
            name="image"
            label="Profile Image"
            type="file"
            accept="image/jpeg, image/png, image/jpg"
          />
          <THInput
            variant="faded"
            radius="sm"
            name="fullName"
            label="Full Name"
            isRequired
          />
          <THInput
            variant="faded"
            radius="sm"
            name="email"
            label="Email Address"
            isRequired
          />
          <THInput
            variant="faded"
            radius="sm"
            name="username"
            label="Username"
            isRequired
          />
          <div className="relative">
            <THInput
              variant="faded"
              radius="sm"
              name="password"
              label="Password"
              isRequired
              type={isPassword ? "password" : "text"}
            />
            <Button
              variant="light"
              size="sm"
              radius="full"
              isIconOnly
              onClick={() => setIsPassword(!isPassword)}
              type="button"
              className="absolute top-3 right-2 text-lg"
            >
              {isPassword ? <PiEyeLight /> : <PiEyeSlashLight />}
            </Button>
          </div>
          <THSelect
            label="Select Gender"
            radius="sm"
            size="md"
            variant="faded"
            name="gender"
            options={options}
            isRequired
          />
          <THDatePicker
            variant="faded"
            name="dateOfBirth"
            label="Date of Birth"
            isRequired
          />
          <Button
            isLoading={isPending}
            type="submit"
            color="primary"
            variant="solid"
            radius="sm"
            className="w-full"
          >
            {isPending ? "Signing UP..." : "Sign Up"}
          </Button>
        </div>
      </THForm>
    </Suspense>
  );
};

export default SignUpForm;
