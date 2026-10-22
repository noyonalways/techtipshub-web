"use client"

import { Button, Divider } from "@heroui/react";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

interface IProps {}

const SocialLogin = ({}: IProps) => {
  return (
    <div className="mb-6">
      <p className="text-center mb-2">or</p>
      <div className="flex justify-center space-x-2">
        <Button
          radius="sm"
          variant="flat"
          isIconOnly
          onClick={() => {
            signIn("google", {
              callbackUrl: "/",
            });
          }}
        >
          <FcGoogle size={24} />
        </Button>
        {/* <Button
        onClick={() => {
          signIn("facebook", {
            callbackUrl: "/",
          });
        }}
      >
        <h4>Continue With Facebook</h4>
      </Button> */}
        <Button
          radius="sm"
          variant="flat"
          isIconOnly
          onClick={() => {
            signIn("github", {
              callbackUrl: "/",
            });
          }}
        >
          <FaGithub size={24} />
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;
