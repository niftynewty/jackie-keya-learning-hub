export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title}: Jackie Keya Learning Hub` },
    { name: "description", content: description },
    { property: "og:title", content: `${title}: Jackie Keya Learning Hub` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
