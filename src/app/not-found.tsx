import Container from "@/components/ui/container";
import { button as buttonStyles } from "@heroui/theme";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for doesn't exist. Please check the URL or return to the homepage for more content.",
  keywords: "404, not found, TechTips Hub, missing page, error page",
  openGraph: {
    title: "Page Not Found",
    description:
      "Oops! The page you're looking for can't be found. Explore more content at TechTips Hub.",
  },
};


interface IProps {}

const NotFoundPage: React.FC<IProps> = () => {
  return (
    <section>
      <Container>
        <div className="min-h-dvh flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl font-bold text-default-600">404</h1>
          <p className="text-xl text-default-500 mt-4 mb-2">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="text-md text-default-400 mb-8">
            It seems we can&apos;t find what you&apos;re looking for.
          </p>

          <Link
            href="/"
            className={`${buttonStyles({
              color: "primary",
              radius: "sm",
              size: "md",
              ...buttonStyles,
            })}`}
          >
            Go Back to Homepage
          </Link>
          
        </div>
      </Container>
    </section>
  );
};

export default NotFoundPage;
