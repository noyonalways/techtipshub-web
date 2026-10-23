// @ts-nocheck

// components/PDFDownloadButton.tsx
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@heroui/button";
import { MdOutlineDownload } from "react-icons/md";
import BlogDocument from "../blog-document";
import { IBlog } from "@/types";

interface IProps {
  blog: IBlog;
}

const PDFDownloadButton = ({ blog }: IProps) => (
  <PDFDownloadLink
    fileName={blog.title}
    document={<BlogDocument blog={blog} />}
  >
    <Button className="text-2xl ml-2" variant="light" isIconOnly radius="full">
      <MdOutlineDownload />
    </Button>
  </PDFDownloadLink>
);

export default PDFDownloadButton;
