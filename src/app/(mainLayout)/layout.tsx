import Footer from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { getCurrentUser } from "@/services/auth";

interface IProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<IProps> = async ({ children }) => {
  // The footer offers "Following" only to a reader who can open it. A short
  // signed-in flag, not the user record, so nothing else travels to the client.
  // A malformed cookie is a signed-out visitor, never a crashed layout.
  const isSignedIn = await getCurrentUser()
    .then(Boolean)
    .catch(() => false);

  return (
    <>
      <Navbar />
      {children}
      <Footer isSignedIn={isSignedIn} />
    </>
  );
};

export default MainLayout;
