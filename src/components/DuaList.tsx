import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart, Share2, Copy } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TasbihCounter } from "@/components/TasbihCounter";
import {
    personalDuas,
    duaForDeceasedMale,
    duaForDeceasedFemale,
    quranicDuas,
    propheticDuas,
    DuaItem,
} from "@/lib/dua-data";

export const DuaList = () => {
    const { t, language } = useLanguage();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const allDuas = [
        ...quranicDuas,
        ...propheticDuas,
        ...personalDuas,
        ...duaForDeceasedMale,
        ...duaForDeceasedFemale,
    ];

    const filterDuas = (duas: DuaItem[]) => {
        if (!debouncedSearchQuery) return duas;
        const query = debouncedSearchQuery.toLowerCase();
        return duas.filter((dua) =>
            dua.arabic.includes(query) ||
            dua.translation?.toLowerCase().includes(query) ||
            dua.transliteration?.toLowerCase().includes(query)
        );
    };

    const getFavoriteDuas = () => {
        return allDuas.filter((dua) => favorites.includes(dua.id));
    };

    const handleShare = async (dua: DuaItem) => {
        const text = `${dua.arabic}\n\n${dua.translation || ''}\n${dua.source || ''}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Dua',
                    text: text,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(text);
            toast.success(t.copied);
        }
    };

    const handleCopy = (dua: DuaItem) => {
        const text = `${dua.arabic}\n\n${dua.translation || ''}\n${dua.source || ''}`;
        navigator.clipboard.writeText(text);
        toast.success(t.copied);
    };

    const renderDuaList = (duaList: DuaItem[]) => {
        const filteredList = filterDuas(duaList);

        if (filteredList.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    {t.noDuasFound}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredList.map((dua, index) => (
                    <Card
                        key={dua.id}
                        className="p-6 animate-fade-in hover:shadow-lg transition-all relative group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => handleCopy(dua)}
                                title={t.copy}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => handleShare(dua)}
                                title={t.share}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                onClick={() => toggleFavorite(dua.id)}
                                title={t.favorites}
                            >
                                <Heart
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isFavorite(dua.id) ? "fill-red-500 text-red-500" : ""
                                    )}
                                />
                            </Button>
                        </div>

                        {/* Mobile visible actions (always visible on touch devices mainly, but we use opacity for cleaner desktop UI. 
                            For mobile we might want them always visible or rely on tap. 
                            Let's make them always visible on mobile by default or handling hover. 
                            Since 'group-hover' can be tricky on mobile, let's make them visible always if typical mobile? 
                            Actually, 'group-hover' often works on tap on mobile. 
                            To be safe, let's remove opacity-0 for now or conditionally apply it.
                            Let's keep it simple: always visible for now to ensure usability, or low opacity faded in.
                        */}
                        <div className="absolute top-4 left-4 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => handleCopy(dua)}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => handleShare(dua)}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                onClick={() => toggleFavorite(dua.id)}
                            >
                                <Heart
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isFavorite(dua.id) ? "fill-red-500 text-red-500" : ""
                                    )}
                                />
                            </Button>
                        </div>

                        <p className="text-2xl font-amiri leading-loose mb-4 text-right pt-8 md:pt-2" lang="ar">
                            {dua.arabic}
                        </p>

                        {dua.source && (
                            <p className="text-sm text-primary/80 font-amiri text-right mb-2" dir="rtl">
                                {dua.source}
                            </p>
                        )}

                        {language === "en" && (dua.transliteration || dua.translation) && (
                            <>
                                {dua.transliteration && (
                                    <p className="text-sm text-muted-foreground italic mb-2">
                                        {dua.transliteration}
                                    </p>
                                )}
                                {dua.translation && (
                                    <p className="text-sm text-foreground">
                                        {dua.translation}
                                    </p>
                                )}
                            </>
                        )}
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <Tabs defaultValue="personal" className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
            <div className="mb-6 relative">
                <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none", // Improved visibility & pointer-events
                    language === "ar" ? "right-3" : "left-3"
                )} />
                <Input
                    placeholder={t.searchPlaceholder}
                    className={cn(
                        "bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md focus:bg-white/15 transition-all text-base", // Enhanced styling
                        language === "ar" ? "pr-10" : "pl-10"
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <TabsList className="flex w-full justify-start overflow-x-auto mb-6 h-auto p-1 gap-2 bg-muted/50 rounded-lg no-scrollbar pb-2">
                <TabsTrigger value="personal" className="min-w-fit px-4 font-amiri text-sm py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    {t.personalDua}
                </TabsTrigger>
                <TabsTrigger value="deceased-male" className="min-w-fit px-4 font-amiri text-sm py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    {t.duaForDeceasedMale}
                </TabsTrigger>
                <TabsTrigger value="deceased-female" className="min-w-fit px-4 font-amiri text-sm py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    {t.duaForDeceasedFemale}
                </TabsTrigger>
                <TabsTrigger value="favorites" className="min-w-fit px-4 font-amiri text-sm py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Heart className="w-4 h-4 inline-block mr-2" />
                    {t.favorites}
                </TabsTrigger>
                <TabsTrigger value="tasbih" className="min-w-fit px-4 font-amiri text-sm py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    {t.tasbih}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-8">
                <div>
                    <h3 className="text-xl font-amiri text-primary mb-4 border-b pb-2">
                        {t.quranicDua}
                    </h3>
                    {renderDuaList(quranicDuas)}
                </div>

                <div>
                    <h3 className="text-xl font-amiri text-primary mb-4 border-b pb-2">
                        {t.propheticDua}
                    </h3>
                    {renderDuaList(propheticDuas)}
                </div>

                {personalDuas.length > 0 && personalDuas[0].arabic !== "سيتم إضافة الأدعية قريباً" && (
                    <div>
                        <h3 className="text-xl font-amiri text-primary mb-4 border-b pb-2">
                            {t.personalDua}
                        </h3>
                        {renderDuaList(personalDuas)}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="deceased-male" className="space-y-4">
                {renderDuaList(duaForDeceasedMale)}
            </TabsContent>

            <TabsContent value="deceased-female" className="space-y-4">
                {renderDuaList(duaForDeceasedFemale)}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
                <h3 className="text-xl font-amiri text-primary mb-4 border-b pb-2">
                    {t.favoriteDuas}
                </h3>
                {renderDuaList(getFavoriteDuas())}
            </TabsContent>

            <TabsContent value="tasbih" className="space-y-4">
                <TasbihCounter />
            </TabsContent>
        </Tabs>
    );
};
