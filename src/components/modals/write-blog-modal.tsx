import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/modal";
import WriteBlog from "../modules/write-blog";
import { GoPencil } from "react-icons/go";


interface IProps {}

const WriteBlogModal = ({}: IProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button
        onClick={onOpen}
        size="sm"
        radius="full"
        variant="solid"
        color="primary"
        startContent={<GoPencil className="text-lg" />}
      >
        Write Blog
      </Button>

      <Modal
        size="3xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create Blog
              </ModalHeader>
              <ModalBody>
                {/* <WriteBlog onClose={onOpenChange} /> */}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default WriteBlogModal;