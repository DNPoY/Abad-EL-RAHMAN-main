import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAlarm } from "@/contexts/AlarmContext";
import { AlarmClock, Bell } from "lucide-react";
import { toast } from "sonner";

export const AlarmChallenge = () => {
    const { t, language } = useLanguage();
    const { isAlarmRinging, stopAlarm, challengeType } = useAlarm();
    const [mathProblem, setMathProblem] = useState({ question: "", answer: 0 });
    const [numberToType, setNumberToType] = useState("");
    const [userAnswer, setUserAnswer] = useState("");

    // Generate a random number for typing challenge
    const generateNumber = () => {
        const num = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
        setNumberToType(String(num));
    };

    // Generate a math problem
    const generateProblem = () => {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operations = ["+", "-", "×"];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let answer = 0;
        let question = "";

        switch (operation) {
            case "+":
                answer = num1 + num2;
                question = `${num1} + ${num2}`;
                break;
            case "-":
                answer = num1 - num2;
                question = `${num1} - ${num2}`;
                break;
            case "×":
                answer = num1 * num2;
                question = `${num1} × ${num2}`;
                break;
        }

        setMathProblem({ question, answer });
    };

    useEffect(() => {
        if (isAlarmRinging) {
            if (challengeType === "number") {
                generateNumber();
            } else if (challengeType === "math") {
                generateProblem();
            }
        }
    }, [isAlarmRinging, challengeType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (challengeType === "normal") {
            toast.success(t.correctAnswer);
            stopAlarm();
            setUserAnswer("");
            return;
        }

        if (challengeType === "number") {
            if (userAnswer === numberToType) {
                toast.success(t.correctAnswer);
                stopAlarm();
                setUserAnswer("");
            } else {
                toast.error(t.wrongAnswer);
                setUserAnswer("");
                generateNumber();
            }
            return;
        }

        if (challengeType === "math") {
            const numericAnswer = parseInt(userAnswer);

            if (numericAnswer === mathProblem.answer) {
                toast.success(t.correctAnswer);
                stopAlarm();
                setUserAnswer("");
            } else {
                toast.error(t.wrongAnswer);
                setUserAnswer("");
                generateProblem();
            }
        }
    };

    if (!isAlarmRinging) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <Card className="w-full max-w-md max-h-screen overflow-auto p-8 animate-pulse-soft">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <Bell className="w-20 h-20 text-primary animate-bounce" />
                            <AlarmClock className="w-12 h-12 text-accent absolute top-0 right-0" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold font-amiri text-primary mb-2">
                            {t.fajrAlarm}
                        </h2>
                        {challengeType === "normal" ? (
                            <p className="text-lg text-muted-foreground font-amiri">
                                {language === "ar" ? "اضغط إيقاف لإطفاء المنبه" : "Click stop to turn off alarm"}
                            </p>
                        ) : challengeType === "number" ? (
                            <p className="text-lg text-muted-foreground font-amiri">
                                {t.enterNumber}
                            </p>
                        ) : (
                            <p className="text-lg text-muted-foreground font-amiri">
                                {t.solveToStop}
                            </p>
                        )}
                    </div>

                    {challengeType === "number" && (
                        <div className="bg-primary/10 rounded-lg p-6">
                            <p className="text-5xl font-bold text-white mb-4 tracking-widest" dir="ltr">
                                {numberToType}
                            </p>
                        </div>
                    )}

                    {challengeType === "math" && (
                        <div className="bg-primary/10 rounded-lg p-6">
                            <p className="text-5xl font-bold text-white mb-4">
                                {mathProblem.question} = ?
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {challengeType !== "normal" && (
                            <Input
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder={language === "ar" ? "أدخل الإجابة" : "Enter answer"}
                                className="text-center text-2xl h-16 font-bold"
                                autoFocus
                                dir="ltr"
                            />
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-amiri"
                            size="lg"
                        >
                            {t.stopAlarm}
                        </Button>
                    </form>

                    <p className="text-sm text-muted-foreground">
                        {challengeType === "normal"
                            ? (language === "ar" ? "منبه عادي" : "Normal alarm")
                            : challengeType === "number"
                                ? (language === "ar" ? "اكتب الرقم الموجود أعلاه" : "Type the number shown above")
                                : (language === "ar" ? "حل المعادلة الحسابية لإيقاف المنبه" : "Solve the math problem to stop the alarm")}
                    </p>
                </div>
            </Card>
        </div>
    );
};
