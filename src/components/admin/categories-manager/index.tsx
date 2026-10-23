"use client";

import BlockError, { RetryButton } from "@/components/admin/block-error";
import { formatCount, formatDate, plural } from "@/components/admin/format";
import {
  quietButton,
  useDebouncedTerm,
} from "@/components/admin/list-controls";
import AdminPagination from "@/components/modules/admin/kit/pagination";
import ConfirmDialog from "@/components/modules/admin/kit/confirm-dialog";
import DataTable from "@/components/modules/admin/kit/data-table";
import DataToolbar from "@/components/modules/admin/kit/data-toolbar";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import SectionCard from "@/components/modules/admin/section-card";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/admin-categories";
import type { ICategoryPayload } from "@/services/admin/categories";
import type { IAdminCategory } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { RiFolder3Line } from "react-icons/ri";
import { categoryValidationSchema, type TCategoryForm } from "./schema";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "name", header: "Category", className: "min-w-[16rem]" },
  { key: "count", header: "Articles", align: "right" as const },
  { key: "created", header: "Added", className: "whitespace-nowrap" },
  { key: "actions", header: "Actions", align: "right" as const },
];

const primaryButton = `inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[6px] bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-500 disabled:opacity-60 sm:min-h-9 ${focusRing}`;

const iconButton = `inline-flex size-11 items-center justify-center rounded-[6px] text-default-700 transition-colors hover:bg-default-100 hover:text-foreground sm:size-9 ${focusRing}`;

const linkClass = `rounded font-medium text-primary-accessible underline-offset-4 hover:underline ${focusRing}`;

/** An answer from the category endpoints. Failures arrive here as data. */
interface ICategoryReply {
  success?: boolean;
  message?: string;
  errorSources?: { message?: string }[];
}

const messageOf = (response: unknown, fallback: string) => {
  const payload = response as ICategoryReply | undefined;

  return payload?.errorSources?.[0]?.message || payload?.message || fallback;
};

/** A create or rename that lands on a name that is already taken (409). */
const isDuplicateName = (response: unknown) =>
  /already exists|duplicate/i.test(messageOf(response, ""));

const descriptionOf = (category: IAdminCategory) =>
  category.description?.trim() ?? "";

const CategoriesManager = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<IAdminCategory | null>(null);

  const resetPage = useCallback(() => setPage(1), []);
  // The API filters on the name; the screen also hides rows whose description
  // matches, so one phrase finds a category whichever field it lives in.
  const searchTerm = useDebouncedTerm(query, resetPage);

  const list = useAdminCategories({ page, limit: PAGE_SIZE, searchTerm });
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormOpenChange,
  } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<TCategoryForm>({
    resolver: zodResolver(categoryValidationSchema),
    defaultValues: { name: "", description: "" },
  });

  const { rows, meta, total, isLoading, isError, error, refetch } = list;

  const needle = searchTerm.trim().toLowerCase();
  const visible = needle
    ? rows.filter((category) =>
        [category.name, descriptionOf(category)].some((value) =>
          value.toLowerCase().includes(needle),
        ),
      )
    : rows;

  const totalPages = Math.max(meta?.totalPages ?? 1, 1);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", description: "" });
    onFormOpen();
  };

  const openEdit = (category: IAdminCategory) => {
    setEditing(category);
    reset({ name: category.name, description: descriptionOf(category) });
    onFormOpen();
  };

  const isSaving = isCreating || isUpdating;

  const onSubmit = handleSubmit((values) => {
    const name = values.name.trim();
    const description = values.description?.trim() ?? "";

    // The API validates the body strictly and rejects a blank description, so
    // the field is left out rather than sent empty.
    const next: ICategoryPayload = description
      ? { name, description }
      : { name };

    const settle = (reply: unknown) => {
      if ((reply as ICategoryReply | undefined)?.success) {
        onFormOpenChange();
        return;
      }

      if (isDuplicateName(reply)) {
        setError("name", {
          type: "server",
          message:
            "A category with this name already exists. Pick another name.",
        });
        setFocus("name");
        return;
      }

      setError("description", {
        type: "server",
        message: messageOf(reply, "The category could not be saved."),
      });
      setFocus("description");
    };

    if (editing) {
      updateCategory({ id: editing._id, payload: next }, { onSuccess: settle });
    } else {
      createCategory(next, { onSuccess: settle });
    }
  });

  const body = () => {
    if (isError) {
      return (
        <BlockError
          title="Categories could not be loaded"
          description={
            error?.message ||
            "The request failed. Check that the API is running, then try again."
          }
          action={<RetryButton onClick={() => refetch()} />}
        />
      );
    }

    return (
      <DataTable
        columns={COLUMNS}
        rows={visible}
        getRowKey={(row) => row._id}
        isLoading={isLoading}
        minWidth="40rem"
        caption="Categories, how many published articles use each, and when each was added"
        emptyState={
          needle ? (
            <EmptyState
              variant="inline"
              icon={<RiFolder3Line className="size-5" />}
              title="No category matches this search"
              description={`No category on this page has "${searchTerm}" in its name or description. Try a shorter word, page through, or clear the field.`}
              action={
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={quietButton}
                >
                  Clear search
                </button>
              }
            />
          ) : (
            <EmptyState
              variant="inline"
              icon={<RiFolder3Line className="size-5" />}
              title="No categories yet"
              description="Authors pick a category when they publish. Add the first one so their articles have a place in the feed."
              action={
                <button
                  type="button"
                  onClick={openCreate}
                  className={primaryButton}
                >
                  <FiPlus aria-hidden className="size-4" />
                  Add the first category
                </button>
              }
            />
          )
        }
        renderCell={(category, columnKey) => {
          const count = category.blogCount ?? 0;

          switch (columnKey) {
            case "name":
              return (
                <div className="max-w-[28rem]">
                  <Link
                    href={`/?category=${encodeURIComponent(category.name)}`}
                    className={linkClass}
                  >
                    {category.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-default-600">
                    {descriptionOf(category) || "No description"}
                  </p>
                </div>
              );

            case "count":
              return (
                <span>
                  {count > 0 ? (
                    formatCount(count)
                  ) : (
                    <span className="text-default-600">None</span>
                  )}
                </span>
              );

            case "created":
              return (
                <span className="text-xs text-default-600">
                  {formatDate(category.createdAt) || "Not recorded"}
                </span>
              );

            case "actions":
              return (
                <div className="flex items-center justify-end gap-0.5">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    className={iconButton}
                  >
                    <FiEdit2 aria-hidden className="size-4" />
                  </button>

                  {count > 0 ? (
                    <button
                      type="button"
                      disabled
                      aria-label={`Delete ${category.name}`}
                      title={`${plural(count, "published article")} use this category, so it cannot be deleted until they are moved or removed.`}
                      className={`${iconButton} cursor-not-allowed text-default-400 hover:bg-transparent hover:text-default-400`}
                    >
                      <FiTrash2 aria-hidden className="size-4" />
                    </button>
                  ) : (
                    <ConfirmDialog
                      trigger={
                        <button
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          className={`${iconButton} text-danger hover:bg-danger/10 hover:text-danger`}
                        >
                          <FiTrash2 aria-hidden className="size-4" />
                        </button>
                      }
                      title={`Delete ${category.name}?`}
                      description="It stops appearing in the feed filter and in the category picker. No articles use it, so nothing is left without a category."
                      confirmLabel="Delete category"
                      tone="danger"
                      isPending={isDeleting}
                      onConfirm={() =>
                        deleteCategory(category._id, {
                          onSuccess: () => {
                            if (page > 1 && rows.length <= 1) {
                              setPage((current) => Math.max(1, current - 1));
                            }
                          },
                        })
                      }
                    />
                  )}
                </div>
              );

            default:
              return null;
          }
        }}
        footer={
          <>
            <p className="border-t border-default/60 bg-default-50/40 px-3 py-2 text-xs tabular-nums text-default-600">
              {meta
                ? `${plural(total, "category", "categories")}${
                    needle
                      ? ` matching "${searchTerm}", ${visible.length} on this page`
                      : ""
                  }`
                : "Counting categories"}
            </p>
            <AdminPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              pageSize={meta?.limit ?? PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        }
      />
    );
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="All categories"
        description="The topics readers filter the feed by, most used first."
        flush
      >
        <DataToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Search categories"
          trailing={
            <button
              type="button"
              onClick={openCreate}
              className={`${primaryButton} shrink-0`}
            >
              <FiPlus aria-hidden className="size-4" />
              New category
            </button>
          }
        />
        {body()}
      </SectionCard>

      <p className="text-xs leading-relaxed text-default-600">
        Renaming a category keeps its articles filed under it. Delete is
        switched off while any published article uses it.
      </p>

      <Modal
        isOpen={isFormOpen}
        onOpenChange={onFormOpenChange}
        radius="lg"
        size="md"
      >
        <ModalContent>
          {(close) => (
            <form onSubmit={onSubmit} noValidate>
              <ModalHeader className="flex flex-col gap-1 pb-1 pt-5">
                <span className="font-[family-name:var(--type-editorial)] text-lg font-semibold tracking-[-0.01em]">
                  {editing ? `Edit ${editing.name}` : "New category"}
                </span>
                <span className="text-sm font-normal leading-relaxed text-default-600">
                  {editing
                    ? "The articles filed here keep their place when the name changes."
                    : "Readers scan these names in the feed filter, so keep the name short."}
                </span>
              </ModalHeader>

              <ModalBody className="gap-4">
                <Input
                  label="Name"
                  labelPlacement="outside"
                  placeholder="React, career advice, dev tooling"
                  autoComplete="off"
                  autoFocus
                  isRequired
                  isDisabled={isSaving}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  {...register("name")}
                />
                <Textarea
                  label="Description"
                  labelPlacement="outside"
                  placeholder="What belongs in this category"
                  description="Optional. Leave it empty and the category shows only its name."
                  minRows={3}
                  maxRows={6}
                  isDisabled={isSaving}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description?.message}
                  {...register("description")}
                />
              </ModalBody>

              <ModalFooter>
                <button
                  type="button"
                  onClick={close}
                  disabled={isSaving}
                  className={quietButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  aria-busy={isSaving}
                  className={primaryButton}
                >
                  {isSaving
                    ? "Saving"
                    : editing
                      ? "Save changes"
                      : "Create category"}
                </button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CategoriesManager;
