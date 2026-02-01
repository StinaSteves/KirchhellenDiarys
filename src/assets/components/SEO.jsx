import { useEffect } from "react";

function upsertMetaByName(name, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkCanonical(href) {
  if (!href) return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function absoluteUrl(pathOrUrl) {
  try {
    return new URL(pathOrUrl, window.location.origin).href;
  } catch {
    return undefined;
  }
}

export default function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
}) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) upsertMetaByName("description", description);

    const canonicalHref = canonical || window.location.origin + window.location.pathname;
    upsertLinkCanonical(canonicalHref);

    upsertMetaByProperty("og:type", ogType);
    upsertMetaByProperty("og:title", ogTitle || title);
    upsertMetaByProperty("og:description", ogDescription || description);
    if (ogImage) upsertMetaByProperty("og:image", absoluteUrl(ogImage));
    upsertMetaByProperty("og:url", canonicalHref);

    upsertMetaByName("twitter:card", twitterCard);
    upsertMetaByName("twitter:title", ogTitle || title);
    upsertMetaByName("twitter:description", ogDescription || description);
    if (ogImage) upsertMetaByName("twitter:image", absoluteUrl(ogImage));

    const id = "seo-jsonld";
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    structuredData,
  ]);

  return null;
}

