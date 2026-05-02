"use client";

import dynamic from "next/dynamic";

const LazyEditor = dynamic(() => import("./Editor"));

export default LazyEditor;
