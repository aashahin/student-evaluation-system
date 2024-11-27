"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Guide as GuideType } from "@/types/api";
import { pb } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Download, Eye, X, RefreshCw } from "lucide-react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function Guide({ type }: { type: string }) {
  const [guide, setGuide] = useState<GuideType>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    id: string;
    url: string;
    type: string;
    name: string;
  } | null>(null);
  const client = pb();

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const fetchGuide = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await client
        .collection("guides")
        .getList<GuideType>(1, 1, {
          filter: `type = "${type}"`,
          sort: "-created",
          requestKey: Math.random().toString(),
        });
      setGuide(records.items[0]);
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إستدعاء الأدلة الإرشادية", {
        description: "يرجى المحاولة مرة أخرى لاحقاً",
      });
    } finally {
      setIsLoading(false);
    }
  }, [client, type]);

  useEffect(() => {
    fetchGuide();
  }, [fetchGuide]);

  const downloadGuide = async (fileUrl: string, fileName: string) => {
    toast.promise(
      async () => {
        try {
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          throw new Error("فشل تحميل الملف");
        }
      },
      {
        loading: "جاري تحميل الملف...",
        success: "تم تحميل الملف بنجاح",
        error: "حدث خطأ أثناء تحميل الملف",
      },
    );
  };

  const getFileType = (fileUrl: string) => {
    const extension = fileUrl.split(".").pop()?.toLowerCase();
    return extension || "";
  };

  const canPreviewFile = (fileUrl: string) => {
    const fileType = getFileType(fileUrl);
    return fileType === "pdf";
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            الأدلة الإرشادية
          </h2>
          <button
            onClick={() => fetchGuide()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>
        </div>

        {!guide || guide.files.length === 0 ? (
          <div className="text-center bg-gray-50 rounded-lg p-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد أدلة إرشادية متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guide.files.map((file, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <FileText className="w-16 h-16 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    دليل إرشادي {index + 1}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    النوع: {getFileType(file).toUpperCase()}
                  </p>
                </div>
                <div className="flex justify-center gap-4 border-t pt-4">
                  {canPreviewFile(file) && (
                    <button
                      onClick={() =>
                        setSelectedFile({
                          id: guide.id,
                          url: file,
                          type: getFileType(file),
                          name: `دليل إرشادي ${index + 1}`,
                        })
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>عرض</span>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      downloadGuide(
                        `${process.env.NEXT_PUBLIC_POCKETBASE_API_URL}/api/files/guides/${guide.id}/${file}`,
                        `guide-${index + 1}.${getFileType(file)}`,
                      )
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedFile && selectedFile.type === "pdf" && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm">
          <div className="container mx-auto h-screen p-4 flex items-center justify-center">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="إغلاق"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={`${process.env.NEXT_PUBLIC_POCKETBASE_API_URL}/api/files/guides/${selectedFile.id}/${selectedFile.url}`}
                    plugins={[defaultLayoutPluginInstance]}
                    defaultScale={1}
                  />
                </Worker>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
