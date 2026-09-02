"use client";

import { useEffect, useRef } from "react";

type CloudinaryUploadResult = {
  event?: string;
  info?: { secure_url?: string; public_id?: string };
};

type CloudinaryWidget = { open: () => void };

export type UploadedImage = { url: string; publicId: string };

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryUploadResult) => void
      ) => CloudinaryWidget;
    };
  }
}

const SCRIPT_SRC = "https://upload-widget.cloudinary.com/global/all.js";

export function useCloudinaryWidget(onSuccess: (image: UploadedImage) => void) {
  const widgetRef = useRef<CloudinaryWidget | null>(null);

  useEffect(() => {
    if (window.cloudinary || document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function open() {
    if (!window.cloudinary) {
      window.alert("O widget de upload ainda está carregando. Tenta de novo em um instante.");
      return;
    }
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          uploadSignature: async (
            callback: (signature: string) => void,
            paramsToSign: Record<string, unknown>
          ) => {
            const response = await fetch("/api/sign-cloudinary-params", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paramsToSign }),
            });
            const data = await response.json();
            callback(data.signature);
          },
          sources: ["local"],
          multiple: false,
          cropping: true,
          croppingAspectRatio: 1,
          croppingShowDimensions: true,
          croppingValidateDimensions: true,
          showSkipCropButton: false,
        },
        (error, result) => {
          if (
            !error &&
            result?.event === "success" &&
            result.info?.secure_url &&
            result.info?.public_id
          ) {
            onSuccess({ url: result.info.secure_url, publicId: result.info.public_id });
          }
        }
      );
    }
    widgetRef.current.open();
  }

  return { open };
}
