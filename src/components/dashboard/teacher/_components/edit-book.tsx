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
import { Upload, X } from "lucide-react";
import { pb } from "@/lib/api";
import Image from "next/legacy/image";
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    page_count: book.page_count ? book.page_count.toString() : "",
    discussion_date: new Date(book.discussion_date).toISOString().split("T")[0],
  });

  const client = pb();

  useEffect(() => {
    if (open && book) {
      setFormData({
        title: book.title,
        author: book.author,
        page_count: book.page_count ? book.page_count.toString() : "",
        discussion_date: new Date(book.discussion_date)
          .toISOString()
          .split("T")[0],
      });
      // Set initial cover preview from existing book cover
      if (book.cover) {
        setCoverPreview(client.files.getURL(book, book.cover));
      }
    }
  }, [book, client, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("يجب أن تكون الصورة من نوع JPEG أو PNG أو WebP أو AVIF");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("author", formData.author);
      formDataToSend.append("page_count", formData.page_count || "0");
      formDataToSend.append("discussion_date", formData.discussion_date);

      if (coverFile) {
        formDataToSend.append("cover", coverFile);
      }

      await client.collection("books").update(book.id, formDataToSend);

      toast.success("تم تعديل الكتاب بنجاح");
      setOpen(false);
      await fetchBooks();
    } catch (error) {
      toast.error("حدث خطأ أثناء تعديل الكتاب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">تعديل الكتاب</DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            قم بتعديل تفاصيل الكتاب
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Cover Image Section */}
          <div className="flex flex-col items-start gap-8">
            <div className="space-y-2">
              <Label htmlFor="cover" className="text-lg font-medium block mb-4">
                صورة الغلاف
              </Label>
              <div className="flex items-center justify-center">
                {coverPreview ? (
                  <div className="relative">
                    <Image
                      src={coverPreview}
                      alt="Book cover preview"
                      className="object-cover rounded-lg shadow-lg"
                      width={260}
                      height={150}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview("");
                        setCoverFile(null);
                      }}
                      className="absolute -top-3 -right-3 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cover" className="cursor-pointer">
                    <div className="w-[260px] h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-500 text-center px-4">
                        اختر صورة الغلاف
                        <br />
                        <span className="text-xs text-gray-400">
                          JPEG, PNG, WebP, AVIF
                        </span>
                      </p>
                    </div>
                  </label>
                )}
                <Input
                  id="cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Book Details Section */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  عنوان الكتاب
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="author" className="text-base font-medium">
                  المؤلف
                </Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="أدخل اسم المؤلف"
                  className="w-full transition-all focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page_count" className="text-base font-medium">
                    عدد الصفحات
                  </Label>
                  <Input
                    id="page_count"
                    name="page_count"
                    type="number"
                    value={formData.page_count}
                    onChange={handleChange}
                    placeholder="أدخل العدد"
                    className="w-full transition-all focus:ring-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="discussion_date"
                    className="text-base font-medium"
                  >
                    تاريخ المناقشة
                  </Label>
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
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="px-6"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 min-w-[120px] bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التعديل...
                </div>
              ) : (
                "تعديل الكتاب"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookDialog;
