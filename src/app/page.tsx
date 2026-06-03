import type { Metadata } from "next";
import { getHomePage, getHomePageSlug } from "@/lib/wordpress";
import styles from "./home.module.scss";

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();

  if (!page) {
    return {
      title: "Home | Own It",
      description:
        "Create a published WordPress page with slug home to edit this homepage in Gutenberg.",
    };
  }

  const title = stripTags(page.title.rendered);
  const description = stripTags(page.excerpt.rendered);

  return {
    title: title ? `${title} | Own It` : "Own It",
    description: description || undefined,
  };
}

export default async function Home() {
  const page = await getHomePage();

  if (!page) {
    return (
      <main className={styles.main}>
        <div className={`${styles.content} ${styles.setup} wp-content`}>
          <p className={styles.setupTitle}>Homepage not set up yet</p>
          <p>
            Create a <strong>published</strong> WordPress page with slug{" "}
            <code>{getHomePageSlug()}</code>, then build the homepage in
            Gutenberg. Changes appear here within about a minute after you
            publish.
          </p>
          <p>
            Pantheon: <strong>Pages → Add New</strong> → set the URL slug to{" "}
            <code>{getHomePageSlug()}</code> → publish.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div
        className={`${styles.content} wp-content`}
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </main>
  );
}
