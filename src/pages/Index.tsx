import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryBanner from "@/components/CategoryBanner";
import TopProducts from "@/components/TopProducts";
import TrendingProducts from "@/components/TrendingProducts";
import NewCollection from "@/components/NewCollection";
import PromoBanners from "@/components/PromoBanners";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <CategoryBanner />
        <TopProducts />
        <TrendingProducts />
        <NewCollection />
        <PromoBanners />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
