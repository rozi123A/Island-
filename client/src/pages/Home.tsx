import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrendingUsers from "@/components/TrendingUsers";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

/**
 * Home Page - Main landing page for ConnectLive
 * Design: Vibrant, modern video chat platform
 * Sections: Hero, Trending Users, Features, FAQ, Footer
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <TrendingUsers />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
}
