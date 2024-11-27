import React from "react";
import { Book } from "@/types/api";
import { Edit2, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { pb } from "@/lib/api";
import { toast } from "sonner";

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
};

const BookTableRow = ({ books, fetchBooks, onEdit }: BookTableRowProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      const client = pb();
      await client.collection("books").delete(bookToDelete.id);
      toast.success("تم حذف الكتاب بنجاح");
      await fetchBooks();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الكتاب");
    }
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  return (
    <>
      {books.map((book) => (
        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
