
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, BarChart2, BookOpenCheck } from 'lucide-react';

const features = [
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Hunt Trackers!',
    description: 'Track your hunts, game, odds, time spent, and encounters.',
  },
  {
    icon: <Eye className="h-8 w-8 text-primary" />,
    title: 'Shiny Nat Dex View!',
    description: 'View your collection compared to every Pokémon that can be shiny hunted.',
  },
  {
    icon: <BookOpenCheck className="h-8 w-8 text-primary" />,
    title: 'Detailed Views!',
    description: 'See your Pokémon with as much detail as Home, with custom notes for additional data.',
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    title: 'Detailed Statistics!',
    description: 'View a tab of detailed statistics with your data!',
  },
];

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-col items-center text-center">
        {icon}
        <CardTitle className="mt-4 text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
);


export function HomeTab() {
  return (
    <main className="flex-1 container mx-auto p-4 md:p-6">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground mb-4">
          Welcome to Shining Showcase
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
          My name is Rosie and I have spent hundreds and hundreds of hours shiny hunting Pokémon. I used to use an app for tracking my hunts, but that app stopped receiving support, so I have built a similar app here, but with more!
        </p>
      </section>

      {/* Features Section */}
      <section className="my-12">
        <h2 className="text-3xl font-bold text-center mb-10">Features of this website:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="my-12">
        <div className="max-w-3xl mx-auto text-center">
           <h3 className="text-2xl font-bold mb-4">Disclaimer</h3>
           <p className="text-sm text-muted-foreground">
            This website was made with the help of AI due to my lack of decent programming skills, as is another reason I do not want to make a profit off of this site, however this site still costs upkeep and any support is greatly appreciated, none of it will go towards me, and all of it will be used for this site and its upkeep
          </p>
        </div>
      </section>

      {/* Support Section */}
      <section className="my-12 py-10 bg-muted/50 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
           <h3 className="text-2xl font-bold mb-4">Support the Showcase</h3>
           <p className="text-lg text-muted-foreground">
            This site is completely free for you to use. However, I have to pay to keep it up, and while you do not gain anything from this, your support keeps the site alive!
          </p>
        </div>
      </section>
    </main>
  );
}
