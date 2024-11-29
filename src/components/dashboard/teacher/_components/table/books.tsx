import React from "react";
import { Book, Discussion, User } from "@/types/api";
import { Edit2, Loader, Search, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { pb } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const BookTableHead = () => (
  <>
    <th
      scope="col"
      className="px-6 py-4 text-start text-sm font-semibold text-gray-900"
    >
      عنوان الكتاب
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      المؤلف
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      عدد الصفحات
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      تاريخ المناقشة
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      الإجراءات
    </th>
  </>
);

type BookTableRowProps = {
  books: Book[];
  fetchBooks: () => Promise<void>;
  onEdit: (book: Book) => void;
  clubMembers?: User[];
  clubId: string;
};

const BookTableRow = ({
  books,
  fetchBooks,
  onEdit,
  clubMembers,
  clubId,
}: BookTableRowProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const client = pb();

  // Filter students based on search query
  const filteredStudents = clubMembers?.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      await client.collection("books").delete(bookToDelete.id);
      toast.success("تم حذف الكتاب بنجاح");
      await fetchBooks();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الكتاب");
    }
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  const fetchAttendanceRecords = async (bookId: string) => {
    setLoading(true);
    try {
      const records = await client
        .collection("discussions")
        .getFullList<Discussion>({
          filter: `book_id = "${bookId}" && club_id = "${clubId}"`,
          expand: "student_id",
        });
      setAttendanceRecords(records);
    } catch (error) {
      toast.error("حدث خطأ أثناء استدعاء سجلات الحضور");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (studentId: string, bookId: string) => {
    try {
      const existingRecord = attendanceRecords.find(
        (record) =>
          record.student_id === studentId && record.book_id === bookId,
      );

      if (existingRecord) {
        await client.collection("discussions").update(existingRecord.id, {
          attended: !existingRecord.attended,
        });
      } else {
        await client.collection("discussions").create({
          student_id: studentId,
          book_id: bookId,
          club_id: clubId,
          discussion_date: selectedBook?.discussion_date,
          attended: true,
        });
      }

      await fetchAttendanceRecords(bookId);
      toast.success("تم تحديث الحضور بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الحضور");
    }
  };

  const isStudentAttended = (studentId: string) => {
    const record = attendanceRecords.find(
      (record) => record.student_id === studentId,
    );
    return record?.attended ?? false;
  };

  return (
    <>
      {books.map((book) => (
        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
          <td
            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 underline decoration-dotted underline-offset-4"
            onClick={() => {
              setSelectedBook(book);
              setAttendanceDialogOpen(true);
              fetchAttendanceRecords(book.id);
            }}
          >
            {book.title}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
            {book.author || "غير محدد"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
            {book.page_count || "غير محدد"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
            {new Date(book.discussion_date).toLocaleDateString("ar-SA")}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
            <div className="flex justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(book)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBookToDelete(book);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))}

      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              حضور مناقشة كتاب: {selectedBook?.title}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              تاريخ المناقشة:{" "}
              {selectedBook?.discussion_date &&
                new Date(selectedBook.discussion_date).toLocaleDateString(
                  "ar-SA",
                )}
            </p>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="البحث عن طالب..."
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div
                className="h-[400px] scrollarea ps-4"
                style={{ maxHeight: "650px" }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {filteredStudents?.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 transition-colors border border-gray-200 rounded-xl shadow-sm ${
                        isStudentAttended(student.id)
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Checkbox
                          id={student.id}
                          checked={isStudentAttended(student.id)}
                          onCheckedChange={() =>
                            selectedBook &&
                            toggleAttendance(student.id, selectedBook.id)
                          }
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={student.id}
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {student.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  إجمالي الحضور:{" "}
                  {attendanceRecords.filter((r) => r.attended).length} من{" "}
                  {clubMembers?.length}
                </p>
                <Button onClick={() => setAttendanceDialogOpen(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف الكتاب؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { BookTableHead, BookTableRow };
