"use client";

import React, {useState} from "react"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Plus} from "lucide-react"
import {pb} from "@/lib/api"
import {GradeLevel} from "@/types/api"
import {Textarea} from "@/components/ui/textarea";

type CreateClubDialogProps = {
    gradeLevels: GradeLevel[];
    onClubCreated: () => void;
}

const CreateClubDialog = ({gradeLevels, onClubCreated}: CreateClubDialogProps) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        grade_level: "",
        max_members: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const client = pb()
            await client.collection('reading_clubs').create({
                ...formData,
                teacher_id: client.authStore.record?.id,
                ...(formData.max_members.length > 0 && { max_members: parseInt(formData.max_members) }),
            })

            setOpen(false)
            setFormData({
                name: "",
                description: "",
                grade_level: "",
                max_members: ""
            })
            onClubCreated()
        } catch (error) {
            console.error('Error creating club:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus size={18} className="ms-2"/>
                    إنشاء نادي جديد
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>إنشاء نادي قراءة جديد</DialogTitle>
                    <DialogDescription>
                        قم بإدخال معلومات النادي الجديد
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">اسم النادي</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="مثال: الشعر العربي"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">وصف النادي</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="أدخل الوصف المفصل حول النادي"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="grade">المرحلة الدراسية</Label>
                            <Select
                                value={formData.grade_level}
                                onValueChange={(value) => setFormData({...formData, grade_level: value})}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر المرحلة"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeLevels.map((grade) => (
                                        <SelectItem key={grade.id} value={grade.id}>
                                            {grade.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_members">الحد الأقصى للأعضاء</Label>
                            <Input
                                id="max_members"
                                type="number"
                                value={formData.max_members}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    max_members: e.target.value
                                })}
                                placeholder="اتركه فارغا للحصول على الحد الأقصى (لا نهائي)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "جاري الإنشاء..." : "إنشاء النادي"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateClubDialog;