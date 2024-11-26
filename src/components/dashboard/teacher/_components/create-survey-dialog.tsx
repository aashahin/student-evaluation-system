"use client";

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {pb} from "@/lib/api";
import {Loader} from "lucide-react";

type CreateSurveyDialogProps = {
    studentId: string;
    clubId: string;
}

const defaultQuestions = [
    {
        question: "ما مدى فهمك للنص المقروء؟",
        answer: "",
    },
    {
        question: "هل تستطيع تلخيص ما قرأت بأسلوبك الخاص؟",
        answer: "",
    },
    {
        question: "كيف تقيم مستوى مشاركتك في النقاشات؟",
        answer: "",
    },
];

export default function CreateSurveyDialog({studentId, clubId}: CreateSurveyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState(defaultQuestions);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const client = pb();
            await client.collection('surveys').create({
                type: "teacher-assessment",
                club_id: clubId,
                student_id: studentId,
                questions: {
                    data: questions
                }
            });

            setOpen(false);
            // Optional: Add success notification
        } catch (error) {
            console.error('Error creating survey:', error);
            // Optional: Add error notification
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link">
                    إضافة تقييم
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>إضافة تقييم جديد</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {questions.map((q, index) => (
                        <div key={index} className="space-y-2">
                            <label className="block text-sm font-medium">
                                {q.question}
                            </label>
                            <textarea
                                className="w-full p-2 border rounded-md"
                                value={q.answer}
                                onChange={(e) => {
                                    const newQuestions = [...questions];
                                    newQuestions[index].answer = e.target.value;
                                    setQuestions(newQuestions);
                                }}
                                required
                            />
                        </div>
                    ))}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="w-4 h-4 animate-spin"/>
                        ) : 'حفظ التقييم'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}