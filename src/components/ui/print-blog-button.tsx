// @ts-nocheck

// components/PrintBlogButton.tsx
"use client";

import { IPost } from "@/types";
import { Button } from "@heroui/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

interface IProps {
  blog: IPost;
}

// Dynamically import PDFDownloadButton with SSR disabled
const PDFDownloadButton = dynamic(() => import("./pdf-download-button"), {
  ssr: false,
});

const PrintBlogButton = ({ blog }: IProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? (
        <PDFDownloadButton blog={blog} />
      ) : (
        <Button isLoading isIconOnly variant="light" />
      )}
    </>
  );
};

export default PrintBlogButton;
