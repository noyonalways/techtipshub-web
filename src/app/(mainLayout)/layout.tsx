import { Navbar } from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

/**
 * The main site shell.
 *
 * It renders no request data: the footer's one signed-in link ("Following") is
 * added by the browser after hydration, from the session the `UserProvider`
 * already loads for the navigation bar. Reading the cookie here instead would
 * make every page under this layout render per request, which costs more than
 * that one link is worth.
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

export default MainLayout;
