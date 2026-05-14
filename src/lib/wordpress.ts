const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const useMockWordPress =
  process.env.NEXT_PUBLIC_USE_MOCK_WP?.toLowerCase() === "true";

export type WordPressPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
};

export type WordPressPage = {
  id: number;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
};

async function requestWordPressJSON<T>(route: string): Promise<T> {
  if (!wordpressUrl) {
    throw new Error(
      "NEXT_PUBLIC_WORDPRESS_URL is not set. Add it to your .env.local file.",
    );
  }

  const normalizedBase = wordpressUrl.replace(/\/$/, "");
  const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
  const wpJsonUrl = `${normalizedBase}/wp-json${normalizedRoute}`;

  const primaryResponse = await fetch(wpJsonUrl, {
    next: { revalidate: 60 },
  });

  if (primaryResponse.ok) {
    return primaryResponse.json() as Promise<T>;
  }

  // Some local WP setups expose REST via ?rest_route= instead of /wp-json/.
  const [routePath, queryString] = normalizedRoute.split("?");
  const fallbackUrl = `${normalizedBase}/?rest_route=${encodeURIComponent(routePath)}${
    queryString ? `&${queryString}` : ""
  }`;
  const fallbackResponse = await fetch(fallbackUrl, {
    next: { revalidate: 60 },
  });

  if (!fallbackResponse.ok) {
    throw new Error(
      `Failed WordPress request (${primaryResponse.status}/${fallbackResponse.status}) for ${routePath}`,
    );
  }

  return fallbackResponse.json() as Promise<T>;
}

export async function getRecentPosts(limit = 6): Promise<WordPressPost[]> {
  if (useMockWordPress || !wordpressUrl) {
    return getMockPosts(limit);
  }

  return requestWordPressJSON<WordPressPost[]>(
    `/wp/v2/posts?per_page=${limit}&_fields=id,slug,date,link,title,excerpt`,
  );
}

export async function getPageBySlug(slug: string): Promise<WordPressPage | null> {
  if (useMockWordPress || !wordpressUrl) {
    return getMockPages().find((page) => page.slug === slug) ?? null;
  }

  const pages = await requestWordPressJSON<WordPressPage[]>(
    `/wp/v2/pages?slug=${slug}&_fields=id,slug,link,title,excerpt,content`,
  );
  return pages[0] ?? null;
}

export async function getBusinessPages(): Promise<WordPressPage[]> {
  if (useMockWordPress || !wordpressUrl) {
    return getMockPages();
  }

  return requestWordPressJSON<WordPressPage[]>(
    "/wp/v2/pages?slug=about,be-counted,services,contact&_fields=id,slug,link,title,excerpt,content",
  );
}

function getMockPosts(limit: number): WordPressPost[] {
  const now = new Date().toISOString();
  const demoPosts: WordPressPost[] = [
    {
      id: 1,
      slug: "welcome-to-continuing-education",
      date: now,
      link: "#",
      title: { rendered: "Welcome to the Continuing Education Portal" },
      excerpt: {
        rendered:
          "This is sample content while your WordPress backend is being prepared.",
      },
    },
    {
      id: 2,
      slug: "building-curriculum-with-nextjs",
      date: now,
      link: "#",
      title: { rendered: "Building Curriculum Pages with Next.js" },
      excerpt: {
        rendered:
          "Use this starter to build course catalogs, lesson pages, and CE resources.",
      },
    },
    {
      id: 3,
      slug: "headless-wordpress-next-steps",
      date: now,
      link: "#",
      title: { rendered: "Headless WordPress: Next Steps" },
      excerpt: {
        rendered:
          "When WordPress is ready, set NEXT_PUBLIC_WORDPRESS_URL and live content will load automatically.",
      },
    },
  ];

  return demoPosts.slice(0, limit);
}

function getMockPages(): WordPressPage[] {
  return [
    {
      id: 201,
      slug: "about",
      title: { rendered: "About Our Business" },
      excerpt: {
        rendered: "Learn who we are, what we do, and how we help clients grow.",
      },
      content: {
        rendered:
          "<p>We are a modern business focused on measurable results, long-term partnerships, and practical digital solutions.</p>",
      },
      link: "#",
    },
    {
      id: 2015,
      slug: "be-counted",
      title: { rendered: "Be Counted" },
      excerpt: {
        rendered: "Join the community and be counted.",
      },
      content: {
        rendered:
          "<p>This page will load from WordPress when a published page with slug <code>be-counted</code> exists.</p>",
      },
      link: "#",
    },
    {
      id: 202,
      slug: "services",
      title: { rendered: "Services" },
      excerpt: {
        rendered:
          "Discover our service offerings tailored to your business goals.",
      },
      content: {
        rendered:
          "<p>Our services include website strategy, design, development, and ongoing optimization for growth.</p>",
      },
      link: "#",
    },
    {
      id: 203,
      slug: "contact",
      title: { rendered: "Contact" },
      excerpt: {
        rendered:
          "Get in touch with us for project inquiries, questions, or collaboration.",
      },
      content: {
        rendered:
          "<p>Reach out via email or phone and we will respond within one business day.</p>",
      },
      link: "#",
    },
  ];
}
