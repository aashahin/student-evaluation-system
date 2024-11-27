"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { pb } from "@/lib/api";
import { Book } from "@/types/api";

type EditBookDialogProps = {
  book: Book;
  fetchBooks: () => Promise<void>;
  setOpen: (open: boolean) => void;
  open: boolean;
};

const EditBookDialog = ({
  book,
  fetchBooks,
  setOpen,
  open,
}: EditBookDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: book.title,
    description: book.description,
    author: book.author,
    page_count: book.page_count ? book.page_count.toString() : "",
    discussion_date: new Date(book.discussion_date).toISOString().split("T")[0],
  });
  const client = pb();

  useEffect(() => {
    if (open && book) {
      setFormData({
        title: book.title,
        description: book.description,
        author: book.author,
        page_count: book.page_count ? book.page_count.toString() : "",
        discussion_date: new Date(book.discussion_date)
          .toISOString()
          .split("T")[0],
      });
    }
  }, [book, open]);

  // Reset form when dialog closes
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      author: "",
      page_count: "",
      discussion_date: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await client.collection("books").update(book.id, {
        ...formData,
        page_count: Number(formData.page_count || 0),
      });
      toast.success("تم تعديل الكتاب بنجاح");
      await fetchBooks();
      handleClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء تعديل الكتاب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">
            تعديل الكتاب
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            قم بتعديل تفاصيل الكتاب
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الكتاب</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="أدخل عنوان الكتاب"
              required
              className="w-full transition-all focus:ring-2"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="description">وصف الكتاب</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="أدخل وصف الكتاب"
              className="w-full transition-all focus:ring-2"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">المؤلف</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="أدخل اسم المؤلف"
              className="w-full transition-all focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_count">عدد الصفحات</Label>
            <Input
              id="page_count"
              name="page_count"
              type="number"
              value={formData.page_count}
              onChange={handleChange}
              placeholder="أدخل عدد الصفحات"
              className="w-full transition-all focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discussion_date">تاريخ المناقشة</Label>
            <Input
              id="discussion_date"
              name="discussion_date"
              type="date"
              value={formData.discussion_date}
              onChange={handleChange}
              required
              className="w-full transition-all focus:ring-2"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التعديل...
                </div>
              ) : (
                "تعديل"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookDialog;
