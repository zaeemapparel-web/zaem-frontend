import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/*",
          "/account/",
          "/account/*",
          "/checkout/",
          "/cart/",
          "/order-success/",
          "/api/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
    ],
    sitemap: "https://zaemstore.com/sitemap.xml",
    host: "https://zaemstore.com",
  };
}