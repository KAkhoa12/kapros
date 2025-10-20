"use client";

import { useState, useRef, useCallback } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { generateComic2Face } from "@/lib/api";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const Comic2FacePage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  // Mảng gradient đẹp cho button
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

  const [currentGradient, setCurrentGradient] = useState<number>(0);

  // Xử lý khi chọn ảnh
  const onFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCrop(undefined);
        setCroppedImage(null);
        setResultImage(null);
        setStatus({ type: "", message: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý kéo thả
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: false,
  });

  // Xử lý paste
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

  // Thiết lập crop ban đầu
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  // Tạo ảnh đã crop
  const generateCroppedImage = useCallback(() => {
    if (imgRef.current && crop?.width && crop?.height) {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Tính toán kích thước thực tế của vùng crop
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Chuyển đổi crop coordinates sang pixel dựa trên đơn vị
      let pixelCrop;
      if (crop.unit === "%") {
        // Nếu crop theo phần trăm, chuyển đổi sang pixel
        pixelCrop = {
          x: (crop.x / 100) * image.naturalWidth,
          y: (crop.y / 100) * image.naturalHeight,
          width: (crop.width / 100) * image.naturalWidth,
          height: (crop.height / 100) * image.naturalHeight,
        };
      } else {
        // Nếu crop theo pixel, scale theo tỷ lệ ảnh
        pixelCrop = {
          x: crop.x * scaleX,
          y: crop.y * scaleY,
          width: crop.width * scaleX,
          height: crop.height * scaleY,
        };
      }

      // Đảm bảo kích thước canvas là số nguyên
      canvas.width = Math.round(pixelCrop.width);
      canvas.height = Math.round(pixelCrop.height);

      // Vẽ ảnh đã crop lên canvas
      ctx?.drawImage(
        image,
        Math.round(pixelCrop.x),
        Math.round(pixelCrop.y),
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height),
        0,
        0,
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height)
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const reader = new FileReader();
          reader.onload = () => {
            setCroppedImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.95
      ); // Chất lượng 95%
    }
  }, [crop]);

  // Xử lý tạo ảnh
  const handleGenerateImage = async () => {
    if (!croppedImage) {
      setStatus({ type: "error", message: "Vui lòng chọn và crop ảnh trước" });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: "", message: "" });

    // Thay đổi gradient khi click
    setCurrentGradient((prev) => (prev + 1) % gradients.length);

    try {
      // Chuyển đổi base64 thành File object để gửi API
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], "comic.jpg", { type: "image/jpeg" });

      // Gọi API thực tế
      const apiResponse = await generateComic2Face(file);

      if (apiResponse.error) {
        setStatus({ type: "error", message: apiResponse.error });
        setIsProcessing(false);
        return;
      }

      if (
        apiResponse.data?.status === "success" &&
        apiResponse.data?.data?.image
      ) {
        setResultImage(apiResponse.data.data.image);
        setStatus({
          type: "success",
          message: apiResponse.data.message || "Tạo ảnh thành công!",
        });
      } else {
        setStatus({
          type: "error",
          message: "API trả về dữ liệu không hợp lệ",
        });
      }

      setIsProcessing(false);
    } catch {
      setStatus({
        type: "error",
        message: "Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Comic2Face"
        description="Convert comic-style illustrations into realistic face images using our advanced AI model."
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cột trái */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">
              Tải ảnh comic lên
            </h2>

            {/* Nút thêm ảnh */}
            <div className="mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 mb-3"
              >
                Chọn ảnh comic từ thiết bị
              </button>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-gray-400">
                  {isDragActive
                    ? "Thả ảnh comic vào đây..."
                    : "Kéo và thả ảnh comic vào đây, hoặc nhấn để chọn"}
                </p>
              </div>

              <div
                ref={pasteAreaRef}
                onPaste={handlePaste}
                tabIndex={0}
                className="mt-3 p-3 bg-gray-800 rounded-lg text-center text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Nhấn Ctrl+V để dán ảnh comic
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

            {/* Khung ảnh crop */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Ảnh comic của bạn
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {selectedImage ? (
                  <div className="w-full max-w-md">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      aspect={1}
                    >
                      <Image
                        width={1000}
                        height={1000}
                        ref={imgRef}
                        src={selectedImage}
                        alt="Selected Comic"
                        className="max-w-full h-auto"
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có ảnh comic được chọn</p>
                )}
              </div>
            </div>

            {/* Nút xác nhận crop */}
            <button
              onClick={generateCroppedImage}
              disabled={!selectedImage}
              className={`w-full py-3 px-4 rounded-lg transition-colors duration-300 ${
                selectedImage
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Xác nhận crop ảnh comic
            </button>
          </div>

          {/* Cột phải */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">
              Ảnh comic đã crop
            </h2>

            {/* Khung ảnh đã crop */}
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {croppedImage ? (
                  <div className="w-full max-w-md aspect-square">
                    <Image
                      width={256}
                      height={256}
                      src={croppedImage}
                      alt="Cropped Comic"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Ảnh comic đã crop sẽ hiển thị ở đây
                  </p>
                )}
              </div>
            </div>

            {/* Nút tạo ảnh với gradient */}
            <div className="mt-8">
              <button
                onClick={handleGenerateImage}
                disabled={isProcessing || !croppedImage}
                className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isProcessing || !croppedImage
                    ? "bg-gray-700 cursor-not-allowed"
                    : `bg-gradient-to-r ${gradients[currentGradient]} animate-gradient`
                }`}
              >
                {isProcessing ? "Đang xử lý..." : "Tạo ảnh thật"}
              </button>

              {/* Thông báo trạng thái */}
              {status.message && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    status.type === "success"
                      ? "bg-green-900/50 text-green-400 border border-green-800"
                      : "bg-red-900/50 text-red-400 border border-red-800"
                  }`}
                >
                  {status.message}
                </div>
              )}

              {/* Kết quả ảnh */}
              {resultImage && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">
                    Kết quả ảnh thật
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="w-full max-w-md aspect-square mx-auto">
                      <Image
                        width={256}
                        height={256}
                        src={`data:image/jpeg;base64,${resultImage}`}
                        alt="Result Face"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white m-4 text-center">
          Demo hướng dẫn
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/arrow_white.png"
              width={100}
              height={100}
              alt=""
              className="rounded-lg translate-x-[120px] rotate-50"
            />
            <Image
              src="/demo_4.jpg"
              width={256}
              height={300}
              alt="h-full w-auto"
              className="rounded-lg"
            />
            <span className="text-justify">
              Nhấn vào chọn ảnh comic của bạn
            </span>
          </div>
          <div className="flex flex-col items-center gap-4 justify-center">
            <Image
              src="/arrow_white.png"
              width={100}
              height={100}
              alt=""
              className="rounded-lg translate-x-[120px] rotate-50"
            />
            <Image
              src="/demo_4.jpg"
              width={256}
              height={300}
              alt="h-full w-auto"
              className="rounded-lg"
            />
            <span className="text-justify">
              Crop ảnh comic thành tỷ lệ khung vuông 1:1 (lưu ý crop nhớ lấy hết
              khuôn mặt trong ảnh comic)
            </span>
          </div>
          <div className="flex flex-col items-center gap-4 justify-center">
            <span className="text-justify">Generate completed!</span>
            <Image
              src="/demo_5.jpg"
              width={256}
              height={300}
              alt="h-full w-auto"
              className="rounded-lg"
            />
            <span className="text-justify">
              Nhấn vào tạo ảnh thật và đợi kết quả!
            </span>
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

export default Comic2FacePage;
