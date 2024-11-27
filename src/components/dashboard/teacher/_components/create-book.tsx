"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { pb } from "@/lib/api";

type CreateBookDialogProps = {
  clubId: string;
  fetchBooks: () => Promise<void>;
};

const CreateBookDialog = ({ clubId, fetchBooks }: CreateBookDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    page_count: "",
    discussion_date: new Date(),
  });
  const client = pb();

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
      await client.collection("books").create({
        ...formData,
        page_count: Number(formData.page_count || 0),
        club_id: clubId,
      });
      toast.success("تم إضافة الكتاب بنجاح");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        author: "",
        page_count: "",
        discussion_date: new Date(),
      });
      await fetchBooks();
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة الكتاب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-end items-center gap-2 cursor-pointer">
          <Button variant="link" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            إضافة كتاب جديد
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-2">
            إضافة كتاب جديد
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            أدخل تفاصيل الكتاب الجديد للمجموعة
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
              value={formData.discussion_date.toString()}
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
                  جاري الإضافة...
                </div>
              ) : (
                "إضافة"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookDialog;
