import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, BookEvaluation } from "@/types/api";
import { pb } from "@/lib/api";
import { toast } from "sonner";
import {
  CalendarIcon,
  BookOpenIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  Loader,
} from "lucide-react";

type BookEvaluationDetailsDialogProps = {
  book: Book;
  studentName?: string;
};

const FullDetailsDialog = ({
  evaluation,
  open,
  onOpenChange,
}: {
  evaluation: BookEvaluation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold mb-4">
          تفاصيل التقييم الكامل
        </DialogTitle>
        <div className="flex flex-col space-y-4">
          <div className="bg-background p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {evaluation.expand?.student_id?.name || "طالب"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(evaluation.created).toLocaleDateString("ar-SA")}
              </span>
            </div>
            <div className="space-y-6">
              {evaluation.evaluation.data.map((item) => (
                <div
                  key={item.question}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {item.question}
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BookEvaluationDetailsDialog = ({
  book,
  studentName,
}: BookEvaluationDetailsDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [evaluations, setEvaluations] = React.useState<BookEvaluation[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedEvaluation, setSelectedEvaluation] =
    React.useState<BookEvaluation | null>(null);

  const fetchEvaluations = React.useCallback(async () => {
    if (!book.id) return;

    setLoading(true);
    try {
      const records = await pb()
        .collection("evaluations_books")
        .getFullList<BookEvaluation>({
          filter: `book_id = "${book.id}"`,
          sort: "created",
          expand: "student_id",
          requestKey: Math.random().toString(),
        });
      setEvaluations(records);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحصول على تقييمات الكتاب");
    } finally {
      setLoading(false);
    }
  }, [book.id]);

  React.useEffect(() => {
    if (open) {
      fetchEvaluations();
    }
  }, [open, fetchEvaluations]);

  const renderEvaluationSummary = (evaluation: BookEvaluation) => {
    const summaryItem = evaluation.evaluation.data[0];
    return (
      <div key={summaryItem.question} className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">
          {summaryItem.question}
        </h4>
        <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-2">
          {summaryItem.answer}
        </p>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="link">عرض التقييمات</Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-50 w-[95vw] md:max-w-[40rem] max-h-[90vh] p-4 sm:p-6 rounded-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 z-10 pb-4">
              <DialogTitle className="text-xl sm:text-2xl font-semibold mb-4">
                تقييمات كتاب: {book.title}
                {studentName && (
                  <span className="text-gray-500 text-lg">
                    {" "}
                    - {studentName}
                  </span>
                )}
              </DialogTitle>

              {/* Stats & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-blue-50 px-4 py-2 rounded-full transition-all hover:bg-blue-100">
                    <span className="text-sm font-medium text-blue-700">
                      {evaluations.length} تقييم
                    </span>
                  </div>
                  <div className="bg-purple-50 px-4 py-2 rounded-full transition-all hover:bg-purple-100">
                    <span className="text-sm font-medium text-purple-700">
                      <BookOpenIcon className="w-4 h-4 inline-block ml-1" />
                      {book.title}
                    </span>
                  </div>
                </div>
                {evaluations.length > 0 && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      تاريخ التقييم:{" "}
                      {new Date(evaluations[0].created).toLocaleDateString(
                        "ar-SA",
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200" />
            </div>

            {/* Evaluations List */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {loading ? (
                <Loader className="animate-spin text-blue-600 w-8 h-8 mx-auto my-8" />
              ) : evaluations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">لا يوجد تقييمات لهذا الكتاب</p>
                </div>
              ) : (
                evaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ClipboardIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {evaluation.expand?.student_id?.name || "طالب"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(evaluation.created).toLocaleDateString(
                          "ar-SA",
                        )}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {renderEvaluationSummary(evaluation)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvaluation(evaluation)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        عرض التفاصيل الكاملة
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedEvaluation && (
        <FullDetailsDialog
          evaluation={selectedEvaluation}
          open={!!selectedEvaluation}
          onOpenChange={(open) => !open && setSelectedEvaluation(null)}
        />
      )}
    </>
  );
};

export default BookEvaluationDetailsDialog;
