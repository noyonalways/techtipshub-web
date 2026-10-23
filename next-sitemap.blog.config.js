/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || "https://techtipshub.vercel.app",
  outDir: "./public",
  sitemapBaseFileName: "sitemap-blogs", // this makes the output file `sitemap-blogs.xml`
  generateIndexSitemap: false,
  generateRobotsTxt: false,
  exclude: ["**"], // exclude everything from pages
  additionalPaths: async () => {
    const paths = [];

    try {
      const res = await fetch(`${process.env.BASE_API}/blogs?limit=100`);
      const json = await res.json();
      const blogs = json.data;

      blogs.forEach((blog) => {
        paths.push({
          loc: `/blogs/${blog.slug}`,
          lastmod: new Date(blog.updatedAt || blog.createdAt).toISOString(),
          changefreq: "daily",
          priority: 0.7,
        });
      });
    } catch (err) {
      console.error("Error generating blog sitemap:", err);
    }

    return paths;
  },
};

module.exports = config;
