"use client";

import { useBlockUser, useGetAllUsers, useUnblockUser } from "@/hooks/user.hook";
import { IUser } from "@/types";
import { Avatar, Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import Link from "next/link";
import { CgSpinner } from "react-icons/cg";
import {
  BlockUnblockConfirmActionModal,
  MakeAdminConfirmationModal,
  DeleteUserAccountConfirmationModal,
} from "../modals";

interface IProps {}

const UsersTable = ({}: IProps) => {
  const { data, isLoading, refetch } = useGetAllUsers();
  const users = data?.data as IUser[];

  const { mutate: blockUser, isPending: isBlockUserPending } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnBlockUserPending } =
    useUnblockUser();

  const handleBlockUser = (id: string) => {
    blockUser(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleUnblockUser = (id: string) => {
    unblockUser(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <Table radius="sm" aria-label="Example table with custom cells">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>ROLE</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>MEMBERSHIP</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        loadingContent={
          <CgSpinner className="animate-spin text-primary text-3xl" />
        }
        emptyContent={"Empty table"}
      >
        {users?.map((user) => (
          <TableRow key={user._id}>
            <TableCell>
              <Link
                href={`/users/@${user.username}`}
                className="inline-flex space-x-2"
              >
                <Avatar src={user.profilePicture} size="sm" color="primary" />
                <div>
                  <h3 className="font-medium">{user.fullName}</h3>
                  <span className="text-xs">{user.email}</span>
                </div>
              </Link>
            </TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
            <TableCell>
              {user?.isPremiumUser ? (
                <Button
                  size="sm"
                  radius="full"
                  variant="flat"
                  color="secondary"
                >
                  Premium
                </Button>
              ) : (
                <Button size="sm" radius="full" variant="flat" color="primary">
                  Basic
                </Button>
              )}
            </TableCell>
            <TableCell className="flex items-center space-x-2">
              <DeleteUserAccountConfirmationModal
                id={user._id}
                role={user.role}
                reFetchUsers={refetch}
              />

              {user.status === "Active" ? (
                <BlockUnblockConfirmActionModal
                  actionType="block"
                  isPending={isBlockUserPending}
                  handleAction={handleBlockUser}
                  user={{ _id: user._id, role: user.role }}
                />
              ) : (
                <BlockUnblockConfirmActionModal
                  actionType="unblock"
                  isPending={isUnBlockUserPending}
                  handleAction={handleUnblockUser}
                  user={{ _id: user._id, role: user.role }}
                />
              )}

              <MakeAdminConfirmationModal
                id={user._id}
                role={user.role}
                status={user.status}
                reFetchUsers={refetch}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
