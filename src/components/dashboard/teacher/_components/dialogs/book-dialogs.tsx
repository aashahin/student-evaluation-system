import React from "react";
import { Book, Discussion, User } from "@/types/api";
import { Loader, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface BookAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBook: Book | null;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredStudents?: User[];
  attendanceRecords: Discussion[];
  clubMembers?: User[];
  onToggleAttendance: (studentId: string, bookId: string) => Promise<void>;
  isStudentAttended: (studentId: string) => boolean;
}

export const BookAttendanceDialog = ({
  open,
  onOpenChange,
  selectedBook,
  loading,
  searchQuery,
  onSearchChange,
  filteredStudents,
  attendanceRecords,
  clubMembers,
  onToggleAttendance,
  isStudentAttended,
}: BookAttendanceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            حضور مناقشة كتاب: {selectedBook?.title}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            تاريخ المناقشة:{" "}
            {selectedBook?.discussion_date &&
              new Date(selectedBook.discussion_date).toLocaleDateString("ar-SA")}
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
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <div
              className="h-[400px] scrollarea ps-4"
              style={{ maxHeight: "650px" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onToggleAttendance(student.id, selectedBook.id)
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
                إجمالي الحضور: {attendanceRecords.filter((r) => r.attended).length}{" "}
                من {clubMembers?.length}
              </p>
              <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface DeleteBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const DeleteBookDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: DeleteBookDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
