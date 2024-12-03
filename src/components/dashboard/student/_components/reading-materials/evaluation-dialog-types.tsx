import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const TypesInput = ({
  item,
  answers,
  setAnswers,
}: {
  item: { title: string; type: string };
  answers: { [_key: string]: string };
  setAnswers: React.Dispatch<React.SetStateAction<{ [_key: string]: string }>>;
}) => {
  const value = answers[item.title] || "";

  return (
    <div className="bg-muted/50 p-6 rounded-lg space-y-4 hover:bg-muted/70 transition-colors">
      <label className="block text-lg font-medium">{item.title}</label>

      {item.type === "rating" ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Label
              key={rating}
              className={`
                  relative group flex flex-col items-center gap-2 cursor-pointer
                  transition-all duration-200
                  ${value === rating.toString() ? "scale-110 text-primary" : "hover:text-primary/80"}
                `}
            >
              <Input
                type="radio"
                name={item.title}
                value={rating}
                checked={value === rating.toString()}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [item.title]: e.target.value,
                  }))
                }
                className="sr-only"
                required
              />
              <span className="text-3xl transition-transform group-hover:scale-110">
                {rating}
              </span>
              {value === rating.toString() && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1"
                >
                  <Check className="w-3 h-3" />
                </motion.div>
              )}
            </Label>
          ))}
        </div>
      ) : item.type === "boolean" ? (
        <div className="flex gap-4 justify-center">
          {[
            { value: "true", label: "نعم" },
            { value: "false", label: "لا" },
          ].map((option) => (
            <Label
              key={option.value}
              className={`
                relative group flex items-center justify-center
                px-6 py-3 rounded-lg cursor-pointer
                transition-all duration-200
                ${
                  value === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary border hover:bg-secondary/70"
                }
              `}
            >
              <Input
                type="radio"
                name={item.title}
                value={option.value}
                checked={value === option.value}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [item.title]: e.target.value,
                  }))
                }
                className="sr-only"
                required
              />
              <span className="text-lg font-medium">{option.label}</span>
              {value === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary-foreground  text-primary rounded-full p-1"
                >
                  <Check className="w-3 h-3" />
                </motion.div>
              )}
            </Label>
          ))}
        </div>
      ) : (
        <div className="relative">
          {item.type === "textarea" ? (
            <Textarea
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              rows={4}
              required
              value={value}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [item.title]: e.target.value,
                }))
              }
              placeholder="اكتب إجابتك هنا..."
            />
          ) : (
            <Input
              type={item.type}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
              value={value}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [item.title]: e.target.value,
                }))
              }
              placeholder="اكتب إجابتك هنا..."
            />
          )}
        </div>
      )}
    </div>
  );
};

export { TypesInput };
