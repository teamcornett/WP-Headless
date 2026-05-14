import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress";
import styles from "../about/about.module.scss";

export const metadata = {
  title: "Be Counted | Headless WordPress Site",
};

export default async function BeCountedPage() {
  const page = await getPageBySlug("be-counted");

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <h1
        className={styles.title}
        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
      />
      <div
        className={`${styles.content} wp-content`}
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </main>
  );
}
