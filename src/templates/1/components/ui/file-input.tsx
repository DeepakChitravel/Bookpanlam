"use client";

import { uploadsUrl } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/api/files";
import { formatFileSize } from "@/lib/utils";
import { FileInput as FileInputProps } from "@/types";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF", "WEBP"];

/* ✅ STRONG NORMALIZER */
const normalizePath = (path: string) => {
  if (!path) return "";

  return path
    .replace(/^https?:\/\/[^/]+\/managerbp\/public\/uploads\//, "")
    .replace(/^uploads\//, "")
    .replace(/^\/+/, "");
};

export default function FileInput({ fileName, setFileName }: FileInputProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (file: File) => {
    if (uploading) return;

    if (!user?.userId || !user?.customer_id) {
      console.error("❌ Missing user_id or customer_id", user);
      return;
    }

    setFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const result = await uploadFile({
        userId: String(user.userId),
        customerId: String(user.customer_id),
        formData,
      });

      if (!result?.success || !result?.files?.length) {
        throw new Error("Upload failed or no file path returned");
      }

      const uploadedPath = normalizePath(result.files[0].filename);
      console.log("🖼 Final stored path:", uploadedPath);

      setFileName(uploadedPath);
    } catch (err) {
      console.error("❌ File upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  /* 🔥 DEBUG — shows final image URL */
  if (fileName) {
    console.log(
      "🖼 Preview URL:",
      `${uploadsUrl}/${normalizePath(fileName)}`
    );
  }

  return (
    <div>
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={fileTypes}
        disabled={uploading}
      >
        <div className="border border-dashed p-4 rounded-lg bg-white flex items-center gap-5 cursor-pointer hover:border-primary transition">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500">
            <ImageIcon />
          </div>

          <div className="text-gray-500 grid gap-0.5">
            <p className="font-medium text-[15px]">
              {file
                ? file.name
                : <>Drag & Drop or <span className="text-primary underline">Browse</span></>}
            </p>
            <p className="text-sm">
              {file ? formatFileSize(file.size) : fileTypes.join(", ")}
            </p>
          </div>
        </div>
      </FileUploader>

      {/* ✅ IMAGE PREVIEW */}
      {fileName && (
        <Image
          src={`${uploadsUrl}/${normalizePath(fileName)}`}
          alt="Customer Photo"
          width={112}
          height={112}
          className="w-28 h-28 rounded-lg object-cover mt-3 border"
          unoptimized
        />
      )}
    </div>
  );
}
