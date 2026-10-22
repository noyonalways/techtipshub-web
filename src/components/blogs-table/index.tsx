"use client";

import { useGetAllPosts } from "@/hooks/post.hook";
import { IPost } from "@/types";
import {
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import { CgSpinner } from "react-icons/cg";
import { AdminDeleteBlogModal } from "../modals";
import UpdateBlogModal from "../modals/update-blog-modal";

interface IProps {}

const BlogsTable = ({}: IProps) => {
  const {
    data: res,
    isLoading,
    refetch: refetchPosts,
  } = useGetAllPosts({ limit: "20" });

  return (
    <Table radius="sm" aria-label="Blogs table with dummy data">
      <TableHeader>
        <TableColumn>AUTHOR</TableColumn>
        <TableColumn>TITLE</TableColumn>
        <TableColumn>PREMIUM</TableColumn>
        <TableColumn>UPVOTES</TableColumn>
        <TableColumn>DOWNVOTES</TableColumn>
        <TableColumn>COMMENTS</TableColumn>
        <TableColumn>VIEWS</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading} // Set to true if simulating loading state
        loadingContent={
          <CgSpinner className="animate-spin text-primary text-3xl" />
        }
        emptyContent={"No blogs available"}
      >
        {res?.data?.map((blog: IPost) => (
          <TableRow key={blog._id}>
            <TableCell>
              <div className="lg:w-auto w-56">
                <Link
                  href={`/users/@${blog.author.username}`}
                  className="w-full flex space-x-2 items-center"
                >
                  <Avatar
                    src={blog.author.profilePicture}
                    size="sm"
                    className="object-cover"
                  />
                  <div className="space-y-1">
                    <h3 className="font-medium">{blog.author.fullName}</h3>
                    <span className="text-xs text-default-500">
                      {format(
                        toZonedTime(new Date(blog.createdAt), "Asia/Dhaka"),
                        "dd-MM-yyyy hh:mm:ss a"
                      )}
                    </span>
                  </div>
                </Link>
              </div>
            </TableCell>
            <TableCell>
              <div className="lg:w-auto w-72">{blog.title}</div>
            </TableCell>
            <TableCell>
              {blog.isPremium ? (
                <span className="px-3 py-1 bg-secondary/80 text-white rounded-full text-xs">
                  Yes
                </span>
              ) : (
                <span className="px-3 py-1 bg-primary/80 text-white rounded-full text-xs">
                  No
                </span>
              )}
            </TableCell>
            <TableCell>{blog.upVotes}</TableCell>
            <TableCell>{blog.downVotes}</TableCell>
            <TableCell>{blog.totalComments}</TableCell>
            <TableCell>{blog.totalViews}</TableCell>
            <TableCell className="flex items-center space-x-2">
              <AdminDeleteBlogModal id={blog._id} refetchPosts={refetchPosts} />

              <UpdateBlogModal post={blog} refetchPosts={refetchPosts} />

              <Button
                as={Link}
                href={`/blogs/${blog.slug}`}
                size="sm"
                radius="sm"
                variant="flat"
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BlogsTable;
