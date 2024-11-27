"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { ReadingClub } from "@/types/api";
import { toast } from "sonner";
import PocketBase from "pocketbase";

type ClubSettingsProps = {
  club: ReadingClub;
  client: PocketBase;
  onClubUpdated: () => Promise<void>;
};

const ClubSettings = ({ club, client, onClubUpdated }: ClubSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: club.name,
    max_members: club.max_members?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await client.collection("reading_clubs").update(club.id, {
        name: formData.name,
        max_members: formData.max_members ? parseInt(formData.max_members) : 15,
      });

      await onClubUpdated();
      setOpen(false);
      toast.success("تم تحديث معلومات النادي بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث معلومات النادي");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إعدادات النادي</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم النادي</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max_members">الحد الأقصى للأعضاء</Label>
              <Input
                id="max_members"
                type="number"
                value={formData.max_members}
                onChange={(e) =>
                  setFormData({ ...formData, max_members: e.target.value })
                }
                min={3}
                placeholder="اتركه فارغاً للحد الافتراضي (15)"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جارِ الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClubSettings;
