"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { User } from "@/types/api";
import { pb } from "@/lib/api";
import { toast } from "sonner";
import { RecordModel } from "pocketbase";

type UpdateAccountDialogProps = {
  user: User | RecordModel;
};

const UpdateAccountDialog = ({ user }: UpdateAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    age: user.age,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const client = pb();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.oldPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("كلمات المرور الجديدة غير متطابقة");
          return;
        }

        try {
          await client.collection("users").update(user.id, {
            oldPassword: formData.oldPassword,
            password: formData.newPassword,
            passwordConfirm: formData.confirmPassword,
          });

          toast.success("تم تحديث كلمة المرور بنجاح");
          window.location.reload();
          return;
        } catch (error) {
          toast.error("خطأ في تحديث كلمة المرور");
          return;
        }
      }

      await client.collection("users").update(user.id, {
        name: formData.name,
        email: formData.email,
        age: formData.age,
      });

      toast.success("تم تحديث الحساب بنجاح");
      setOpen(false);

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الحساب");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex justify-start sm:p-0 sm:h-8"
          onClick={() => setOpen(true)}
        >
          تعديل الحساب
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الحساب</DialogTitle>
            <DialogDescription>
              تعديل حسابك هنا, انقر على حفظ بعد الانتهاء
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">الإسم</Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="age">العمر</Label>
              <Input
                type="number"
                id="age"
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="oldPassword">كلمة المرور الحالية</Label>
                <Input
                  type="password"
                  id="oldPassword"
                  value={formData.oldPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPassword: e.target.value })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="confirmPassword">
                  تأكيد كلمة المرور الجديدة
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">حفظ التغييرات</Button>
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default UpdateAccountDialog;
