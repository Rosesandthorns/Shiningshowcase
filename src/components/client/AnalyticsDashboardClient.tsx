
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "../ui/badge";
import { Sparkles, Star, Target, Gamepad2, Dna, GitCompareArrows, Hash, BarChart2, TrendingUp, BookCopy } from "lucide-react";

type AnalyticsData = {
    mostCommonType: string;
    rarestType: string;
    typeChartData: { name: string; value: number }[];
    rarestGame: string;
    alphaCount: number;
    genCompletion: { name: string; caught: number; total: number; percentage: number }[];
    legendaryMythicalCount: number;
    nationalDexCompletion: number;
    evolutionLineCompletion: number;
    remainingShinies: number;
    duplicateShinies: number;
    mostCommonDuplicate: string;
    averageLevel: number;
    averageMoves: number;
};

interface AnalyticsDashboardClientProps {
    initialData: AnalyticsData;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export function AnalyticsDashboardClient({ initialData }: AnalyticsDashboardClientProps) {
    const {
        mostCommonType,
        rarestType,
        typeChartData,
        rarestGame,
        alphaCount,
        genCompletion,
        legendaryMythicalCount,
        nationalDexCompletion,
        remainingShinies,
        duplicateShinies,
        mostCommonDuplicate,
        averageLevel,
        averageMoves
    } = initialData;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Most Common Type" value={mostCommonType} icon={TrendingUp} description={`Rarest: ${rarestType}`} />
            <StatCard title="Rarest Game Origin" value={rarestGame} icon={Gamepad2} />
            <StatCard title="Alpha Shinies" value={alphaCount} icon={Dna} />
            <StatCard title="Legendaries/Mythicals" value={legendaryMythicalCount} icon={Star} />

            <Card className="md:col-span-2 shadow-lg">
                <CardHeader>
                    <CardTitle>Most Common Shiny Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={typeChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                            <Tooltip
                                cursor={{ fill: 'hsla(var(--accent), 0.5)' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            />
                            <Bar dataKey="value" name="Count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card className="md:col-span-2 lg:col-span-4 shadow-lg">
                <CardHeader>
                    <CardTitle>Generation Completion</CardTitle>
                    <CardDescription>Shiny Pokédex completion for each generation.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {genCompletion.map(gen => (
                        <div key={gen.name}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{gen.name}</span>
                                <span className="text-sm text-muted-foreground">{gen.caught} / {gen.total}</span>
                            </div>
                            <Progress value={gen.percentage} />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <StatCard title="National Dex Completion" value={`${nationalDexCompletion.toFixed(2)}%`} icon={Sparkles} />
            <StatCard title="Remaining for Living Dex" value={remainingShinies} icon={Target} />
            <StatCard title="Duplicate Shinies" value={duplicateShinies} icon={BookCopy} description={`Most common: ${mostCommonDuplicate}`} />
            <StatCard title="Average Level" value={averageLevel.toFixed(1)} icon={BarChart2} />

        </div>
    );
}
