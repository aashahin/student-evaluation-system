import { pb } from "@/lib/api";
import { useState, useCallback } from "react";
import { Utils } from "@/types/api";
import { ClientResponseError } from "pocketbase";
import { toast } from "sonner";
import { BookMarked, Download, Eye, RefreshCw, X } from "lucide-react";

interface ReaderToolkitState {
  file: string;
  loading: boolean;
  isModalOpen: boolean;
  fileType: string;
}

const ReaderToolkit = () => {
  const client = pb();
  const [state, setState] = useState<ReaderToolkitState>({
    file: "",
    loading: false,
    isModalOpen: false,
    fileType: "",
  });

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ClientResponseError) {
      const errorMessage =
        error.status === 404
          ? "لم يتم العثور على ملف الحقيبة المتعلقة بك"
          : "حدث خطأ غير متوقع ما أثناء الحصول على ملف الحقيبة المتعلقة بك";
      toast.error(errorMessage);
    }
  }, []);

  const downloadFile = useCallback(
    async (fileUrl: string = state.file) => {
      if (!fileUrl) return;

      toast.promise(
        async () => {
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error("فشل تحميل الملف");

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = `reader_toolkit.${state.fileType}`;
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        {
          loading: "جاري تحميل الملف...",
          success: "تم تحميل الملف بنجاح",
          error: "حدث خطأ أثناء تحميل الملف",
        },
      );
    },
    [state.file, state.fileType],
  );

  const fetchFile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await client
        .collection("utils")
        .getFirstListItem<Utils>('key = "reader_toolkit"', {
          requestKey: crypto.randomUUID(),
        });

      const fileUrl = `${process.env.NEXT_PUBLIC_POCKETBASE_API_URL}/api/files/utils/${response.id}/${response.file}`;
      const fileType = response?.file?.split(".").pop()?.toLowerCase() || "";

      setState((prev) => ({
        ...prev,
        file: fileUrl,
        fileType,
        isModalOpen: fileType === "pdf",
      }));

      if (fileType !== "pdf") {
        await downloadFile(fileUrl);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [client, downloadFile, handleError]);

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isModalOpen: false }));
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">حقيبة القارئ</h2>
      </div>

      <div className="text-center bg-gray-50 rounded-lg p-8">
        <BookMarked className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          حقيبة القارئ الخاصة بك
        </h3>
        <p className="text-gray-500 mb-6">
          اضغط على الزر أدناه لعرض محتويات حقيبة القارئ الخاصة بك
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={fetchFile}
            disabled={state.loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {state.loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {state.fileType === "pdf" ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </>
            )}
            <span>
              {state.fileType === "pdf" ? "عرض الحقيبة" : "تحميل الحقيبة"}
            </span>
          </button>
          {state.file && state.fileType === "pdf" && (
            <button
              onClick={() => downloadFile()}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>تحميل</span>
            </button>
          )}
        </div>
      </div>

      {state.isModalOpen && state.file && state.fileType === "pdf" && (
        <Modal file={state.file} onClose={closeModal} />
      )}
    </div>
  );
};

interface ModalProps {
  file: string;
  onClose: () => void;
}

const Modal = ({ file, onClose }: ModalProps) => (
  <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm">
    <div className="container mx-auto h-screen p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">حقيبة القارئ</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={file} className="w-full h-full" title="حقيبة القارئ" />
        </div>
      </div>
    </div>
  </div>
);

export default ReaderToolkit;
