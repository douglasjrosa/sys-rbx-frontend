import { SitemapStream, streamToPromise } from "sitemap";
import { getStrapiURL } from "utils/api";

export default async (req, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: `https://${req.headers.host}`,
      cacheTime: 600000,
    });

    // Get all pages from Strapi
    const pages = await (await fetch(getStrapiURL("/pages"))).json();

    const slugExceptions = ["teste", "images"];
    
    // Create each URL row
    pages.forEach((page) => {
        if(!slugExceptions.includes(page.slug)){
            smStream.write({
                url: `/${page.slug}`,
                changefreq: "daily",
                priority: 0.9,
            });
        }
    });

    // End sitemap stream
    smStream.end();

    // XML sitemap string
    const sitemapOutput = (await streamToPromise(smStream)).toString();

    // Change headers
    res.writeHead(200, {
      "Content-Type": "application/xml",
    });

    // Display output to user
    res.end(sitemapOutput);
  } catch (e) {
    console.log(e);
    res.send(JSON.stringify(e));
  }
};
