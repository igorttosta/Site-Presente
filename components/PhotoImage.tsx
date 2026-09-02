"use client";

import { CldImage, type CldImageProps } from "next-cloudinary";

export default function PhotoImage(props: CldImageProps) {
  return <CldImage {...props} />;
}
