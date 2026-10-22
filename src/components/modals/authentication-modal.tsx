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
                <p className="text-default-500">
                  You are not currently logged in. Please login first to
                  continue.
                </p>
                <div className="mb-4 mt-2 flex gap-2">
                  <Button
                    variant="flat"
                    color="primary"
                    className="flex-1"
                    radius="sm"
                    as={Link}
                    href={`/signup?redirect=${redirect}`}
                  >
                    Register
                  </Button>

                  <Button
                  variant="flat"
                    color="secondary"
                    className="flex-1"
                    radius="sm"
                    as={Link}
                    href={`/login?redirect=${redirect}`}
                  >
                    Login
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
