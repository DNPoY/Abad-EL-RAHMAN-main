import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SettingsPage } from "@/components/SettingsPage";

interface SettingsDialogProps {
    trigger?: React.ReactNode;
}

export const SettingsDialog = ({ trigger }: SettingsDialogProps) => {
    const { language } = useLanguage();

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Settings className="w-5 h-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto bg-[#094231] border-white/20" dir={language === "ar" ? "rtl" : "ltr"}>
                <DialogHeader>
                    <DialogTitle className="font-amiri flex items-center gap-2 text-white">
                        <Settings className="w-5 h-5" />
                        {language === "ar" ? "الإعدادات" : "Settings"}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <SettingsPage isEmbedded={true} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
