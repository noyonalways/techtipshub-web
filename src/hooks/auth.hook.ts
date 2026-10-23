import {
  forgetPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "@/services/auth";
import { TLogin } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUserRegister = () => {
  return useMutation<any, Error, FormData>({
    mutationKey: ["USER_REGISTER"],
    mutationFn: async (payload) => await registerUser(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "user-register",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "user-register",
        });
      }
    },
  });
};
export const useUserLogin = () => {
  return useMutation<any, Error, TLogin>({
    mutationKey: ["USER_LOGIN"],
    mutationFn: async (payload) => await loginUser(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "user-login",
        });
      }
      if (data.success) {
        toast.success(data?.message, {
          id: "user-login",
        });
      }
    },
  });
};

export const useForgetPassword = () => {
  return useMutation<any, Error, { email: string }>({
    mutationKey: ["FORGOT_PASSWORD"],
    mutationFn: async (payload) => await forgetPassword(payload),
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message, {
          id: "password-reset",
        });
      }
      if (data.success) {
        toast.success(
          "Password reset link sent to your email address successfully!",
          {
            id: "password-reset",
          }
        );
      }
    },
  });
};

export const useResetPassword = () => {
  return useMutation<any, Error, { newPassword: string; token: string }>({
    mutationKey: ["RESET_PASSWORD"],
    mutationFn: async (payload) => await resetPassword(payload),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Password updated. You can sign in now.", {
          id: "reset-password",
        });
      }
    },
  });
};
