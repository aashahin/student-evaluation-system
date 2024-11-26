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
import {Textarea} from "@/components/ui/textarea"
import {AnimatePresence, motion} from "framer-motion";

type CreateClubDialogProps = {
    gradeLevels: GradeLevel[];
    onClubCreated: () => void;
}

type FormState = {
    errors: {
        name?: string;
        grade_level?: string;
    };
    message?: string;
}

const initialState: FormState = {
    errors: {}
}

const CreateClubDialog = ({gradeLevels, onClubCreated}: CreateClubDialogProps) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formState, setFormState] = useState<FormState>(initialState)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        grade_level: "",
        max_members: ""
    })

    const validateForm = (): boolean => {
        const errors: FormState['errors'] = {}

        if (!formData.name.trim()) {
            errors.name = "اسم النادي مطلوب"
        }

        if (!formData.grade_level) {
            errors.grade_level = "المرحلة الدراسية مطلوبة"
        }

        setFormState({errors})
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const client = pb()
            await client.collection('reading_clubs').create({
                name: formData.name,
                grade_level: formData.grade_level,
                teacher_id: client.authStore.record?.id,
                ...(formData.max_members.length > 0 && {max_members: parseInt(formData.max_members)}),
                ...(formData.description.length > 0 && {description: formData.description}),
            })

            setOpen(false)
            setFormData({
                name: "",
                description: "",
                grade_level: "",
                max_members: ""
            })
            setFormState(initialState)
            onClubCreated()
        } catch (error) {
            setFormState({
                errors: {},
                message: "حدث خطأ أثناء إنشاء النادي"
            })
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
                    {formState.message && (
                        <AnimatePresence>
                            {formState.message && (
                                <motion.div
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -10}}
                                    className="p-3 rounded-lg bg-red-50 text-red-600 text-sm"
                                >
                                    <p>{formState.message}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="flex">
                                اسم النادي
                                <span className="text-red-500 mr-1">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={formState.errors.name ? "border-red-500" : ""}
                                required
                                placeholder="مثال: الشعر العربي"
                            />
                            {formState.errors.name && (
                                <AnimatePresence>
                                    {formState.errors && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -10}}
                                            className="p-3 rounded-lg bg-red-50 text-red-600 text-sm"
                                        >
                                            <p>{formState.errors.name}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
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
                            <Label htmlFor="grade" className="flex">
                                المرحلة الدراسية
                                <span className="text-red-500 mr-1">*</span>
                            </Label>
                            <Select
                                value={formData.grade_level}
                                onValueChange={(value) => setFormData({...formData, grade_level: value})}
                                required
                            >
                                <SelectTrigger className={formState.errors.grade_level ? "border-red-500" : ""}>
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
                            {formState.errors.grade_level && (
                                <span className="text-red-500 text-sm">{formState.errors.grade_level}</span>
                            )}
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
                                min={3}
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
