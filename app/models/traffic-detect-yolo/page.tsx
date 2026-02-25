"use client";

import { useCallback, useRef, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { detectTrafficDetectYOLO } from "@/lib/api";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const YOLODetectorPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedImage, setDetectedImage] = useState<string | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });
  const [currentGradient, setCurrentGradient] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const classes = ["bus", "car", "motorbike", "person", "truck"];
  const gradients = [
    "from-purple-500 via-purple-600 to-blue-500",
    "from-cyan-500 to-blue-500",
    "from-green-400 to-blue-500",
    "from-yellow-400 via-red-500 to-pink-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-blue-500 to-teal-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
  ];

  const onFileChange = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setDetectedImage(null);
        setStatus({ type: "", message: "" });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: false,
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          onFileChange(blob);
          return;
        }
      }
    }
  };

  const handleClassChange = (className: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses((prev) => [...prev, className]);
      return;
    }
    setSelectedClasses((prev) => prev.filter((item) => item !== className));
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      setStatus({ type: "error", message: "Vui lòng chọn ảnh trước." });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: "", message: "" });
    setCurrentGradient((prev) => (prev + 1) % gradients.length);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], "traffic.jpg", { type: "image/jpeg" });

      const apiResponse = await detectTrafficDetectYOLO(file, selectedClasses);

      if (apiResponse.error) {
        setStatus({ type: "error", message: apiResponse.error });
        return;
      }

      if (
        apiResponse.data?.status === "success" &&
        apiResponse.data?.data?.image
      ) {
        setDetectedImage(apiResponse.data.data.image);
        setStatus({
          type: "success",
          message: apiResponse.data.message || "Detect thành công!",
        });
      } else {
        setStatus({
          type: "error",
          message: apiResponse.data?.message || "API trả về dữ liệu không hợp lệ",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Đã xảy ra lỗi khi detect ảnh. Vui lòng thử lại.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!detectedImage) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${detectedImage}`;
    link.download = "traffic_detected.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Breadcrumb
        pageName="Traffic Detect YOLO"
        description="Detect traffic objects from your image with YOLO and filter by selected classes."
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Tải ảnh giao thông</h2>

            <div className="mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors duration-300 hover:bg-blue-700"
              >
                Chọn ảnh từ thiết bị
              </button>

              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-300 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-gray-400">
                  {isDragActive
                    ? "Thả ảnh vào đây..."
                    : "Kéo và thả ảnh vào đây, hoặc nhấn để chọn"}
                </p>
              </div>

              <div
                ref={pasteAreaRef}
                onPaste={handlePaste}
                tabIndex={0}
                className="mt-3 rounded-lg bg-gray-800 p-3 text-center text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Nhấn Ctrl+V để dán ảnh
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && onFileChange(e.target.files[0])
                }
              />
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium text-white">Ảnh đầu vào</h3>
              <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-gray-800 p-4">
                {selectedImage ? (
                  <Image
                    width={800}
                    height={600}
                    src={selectedImage}
                    alt="Selected traffic"
                    className="h-auto max-w-full rounded-lg"
                    unoptimized
                  />
                ) : (
                  <p className="text-gray-500">Chưa có ảnh được chọn</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-white">Chọn class detect</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {classes.map((className) => (
                  <label
                    key={className}
                    className="flex cursor-pointer items-center rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-200 transition-colors hover:border-gray-500"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(className)}
                      onChange={(e) =>
                        handleClassChange(className, e.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="ml-2 capitalize">{className}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Bỏ trống để detect tất cả class.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Kết quả detect</h2>

            <div className="mb-6 flex min-h-[300px] items-center justify-center rounded-lg bg-gray-800 p-4">
              {detectedImage ? (
                <Image
                  width={800}
                  height={600}
                  src={`data:image/png;base64,${detectedImage}`}
                  alt="Detected traffic"
                  className="h-auto max-w-full rounded-lg"
                  unoptimized
                />
              ) : (
                <p className="text-gray-500">Ảnh kết quả sẽ hiển thị ở đây</p>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleDetect}
                disabled={isProcessing || !selectedImage}
                className={`w-full rounded-lg px-6 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.02] ${
                  isProcessing || !selectedImage
                    ? "cursor-not-allowed bg-gray-700"
                    : `animate-gradient bg-gradient-to-r ${gradients[currentGradient]}`
                }`}
              >
                {isProcessing ? "Đang xử lý..." : "Detect ảnh"}
              </button>

              {status.message && (
                <div
                  className={`mt-4 rounded-lg border p-3 ${
                    status.type === "success"
                      ? "border-green-800 bg-green-900/50 text-green-400"
                      : "border-red-800 bg-red-900/50 text-red-400"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={!detectedImage}
                className={`mt-4 w-full rounded-lg px-4 py-3 transition-colors duration-300 ${
                  detectedImage
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "cursor-not-allowed bg-gray-700 text-gray-500"
                }`}
              >
                Tải ảnh kết quả
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </>
  );
};

export default YOLODetectorPage;
