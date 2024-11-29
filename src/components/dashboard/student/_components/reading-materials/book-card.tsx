import { useCallback, useEffect, useState } from "react";
import { Book, EvaluationBookCard } from "@/types/api";
import PocketBase, { ClientResponseError } from "pocketbase";
import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircle,
  ClipboardEdit,
} from "lucide-react";
import Image from "next/image";
import EvaluationDialog from "./evaluation-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const BookCard = ({
  book,
  isRead,
  onMarkAsRead,
  client,
  studentId,
  gradeLevel,
}: {
  book: Book;
  isRead: boolean;
  onMarkAsRead: (id: string) => void;
  client: PocketBase;
  studentId: string;
  gradeLevel: string;
}) => {
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [evaluationBook, setEvaluationBook] =
    useState<EvaluationBookCard | null>(null);
  const discussionDate = new Date(book.discussion_date);
  const isUpcoming = discussionDate > new Date();

  const fetchEvaluationBook = useCallback(async () => {
    try {
      const response = await client
        .collection("evaluations_books")
        .getFirstListItem<EvaluationBookCard>(
          `student_id = "${studentId}" && book_id = "${book.id}"`,
          {
            requestKey: Math.random().toString(),
          },
        );
      setEvaluationBook(response);
    } catch (error) {
      if (error instanceof ClientResponseError) {
        if (error.status === 404) {
          setEvaluationBook(null);
          return;
        }
      }
      toast.error("حدث خطأ أثناء الحصول على نموذج التقييم لهذا الكتاب");
    }
  }, [client, studentId, book.id]);

  useEffect(() => {
    fetchEvaluationBook();
  }, [client, studentId, book.id, fetchEvaluationBook]);

  const handleMarkAsRead = () => {
    setShowConfirmDialog(false);
    onMarkAsRead(book.id);
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {isRead ? (
            <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
              <CheckCircle className="w-4 h-4" />
              تمت القراءة
            </span>
          ) : isUpcoming ? (
            <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
              <CalendarIcon className="w-4 h-4" />
              قادم
            </span>
          ) : null}
        </div>

        {/* Image Container */}
        <div className="aspect-[3/4] relative overflow-hidden rounded-t-2xl">
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-[1] transition-opacity duration-300 ${isHovered ? "opacity-80" : "opacity-60"}`}
          />
          <Image
            src={client.files.getURL(book, book.cover)}
            alt={book.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            layout="fill"
          />
          {isRead && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[2] transition-all duration-300">
              <CheckCircle className="w-16 h-16 text-green-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800 text-right line-clamp-1 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-gray-600 text-right font-medium line-clamp-1">
              {book.author}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-start">
              <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <BookOpenIcon className="w-4 h-4" />
                {book.page_count} صفحة
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <CalendarIcon className="w-4 h-4" />
                {discussionDate.toLocaleDateString("ar-SA")}
              </span>
            </div>

            {isRead ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  disabled
                  variant="ghost"
                  className="rounded-xl font-medium bg-green-100 text-green-600 cursor-default flex items-center justify-center gap-2 disabled:opacity-100"
                >
                  <CheckCircle className="w-5 h-5" />
                  تمت القراءة
                </Button>
                {!evaluationBook && (
                  <Button
                    onClick={() => setShowEvaluation(true)}
                    className="rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <ClipboardEdit className="w-5 h-5" />
                    إضافة تقييم
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="w-full font-medium rounded-xl flex items-center justify-center gap-2"
              >
                <BookmarkIcon className="w-5 h-5" />
                تحديد كمقروء
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تحديد الكتاب كمقروء</AlertDialogTitle>
            <AlertDialogDescription>
              هل قرأت هذا الكتاب بالفعل؟ بعد التأكيد سيطلب منك تقييم الكتاب بناء
              علي ما قرأته.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsRead}>
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EvaluationDialog
        open={showEvaluation}
        onOpenChange={setShowEvaluation}
        bookId={book.id}
        studentId={studentId}
        gradeLevel={gradeLevel}
        client={client}
      />
    </>
  );
};

export default BookCard;
