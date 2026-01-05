"use client";

import React, { Suspense } from "react";
import styles from "./Editor.module.css";
import Dashboard from "@/components/Dashboard";
import { useSiteContent } from "@/components/useSiteContent";

const Editor = () => {
  const siteContent = useSiteContent();
  const { title, subtitle } = siteContent.editor;

  return (
    <section className={styles.editorSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* 首页编辑器使用 Dashboard 的"生图模块" */}
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <Dashboard variant="generateOnly" />
        </Suspense>
      </div>
    </section>
  );
};

export default Editor;
