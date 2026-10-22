import { useDeleteUserAccount } from "@/hooks/user.hook";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";

interface IProps {
  id: string;
  role: "Admin" | "User";
  reFetchUsers: () => void;
}

const DeleteUserAccountConfirmationModal = ({ id, role, reFetchUsers }: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutate: deleteAccount, isPending } = useDeleteUserAccount()

  const handleMakeAdmin = () => {
    deleteAccount(id, {
      onSuccess: () => {
        reFetchUsers()
      }
    })
    onOpenChange();
  };

  return (
    <>
      <Button
        isDisabled={role === "Admin"}
        onClick={onOpen}
        size="sm"
        radius="sm"
        variant="flat"
        color="danger"
        isLoading={isPending}
      >
        Delete Account
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm to delete account?
              </ModalHeader>
              <ModalBody>
                Are you sure you want to delete this user account?
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

export default DeleteUserAccountConfirmationModal;
