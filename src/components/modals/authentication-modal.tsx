"use client";

import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import Link from "next/link";
import { ReactNode } from "react";

interface IProps {
  redirect: string;
  buttonContent: ReactNode;
  className?: string;
}

const AuthenticationModal = ({ redirect, buttonContent, ...props }: IProps) => {  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button onPress={onOpen} {...props} >
        {buttonContent}
      </Button>
      <Modal size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Authentication Required
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  You are not currently logged in. Please login first to
                  continue.
                </p>
                <div className="mb-4 mt-2 flex gap-2">
                  <Button
                    as={Link}
                    className="flex-1 font-semibold"
                    color="primary"
                    href={`/signup?redirect=${redirect}`}
                    radius="sm"
                  >
                    Sign up
                  </Button>

                  <Button
                    as={Link}
                    className="flex-1 border border-default-300 font-medium text-foreground hover:bg-default-100"
                    href={`/login?redirect=${redirect}`}
                    radius="sm"
                    variant="bordered"
                  >
                    Log in
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthenticationModal;
