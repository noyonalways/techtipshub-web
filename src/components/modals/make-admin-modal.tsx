import { useMakeAdmin } from "@/hooks/user.hook";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";

interface IProps {
  id: string;
  role: "Admin" | "User";
  status: "Active" | "Blocked";
  reFetchUsers: () => void;
}

const MakeAdminConfirmationModal = ({ id, role, status, reFetchUsers }: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutate: makeAdmin, isPending } = useMakeAdmin()

  const handleMakeAdmin = () => {
    makeAdmin(id, {
      onSuccess: () => {
        reFetchUsers()
      }
    })
    onOpenChange();
  };

  return (
    <>
      <Button
        isDisabled={role === "Admin" || status === "Blocked"}
        onClick={onOpen}
        size="sm"
        radius="sm"
        variant="flat"
        isLoading={isPending}
      >
        Make Admin
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm make Admin?
              </ModalHeader>
              <ModalBody>
                Are you sure you want to make this user to Admin?
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onClick={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleMakeAdmin}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MakeAdminConfirmationModal;
