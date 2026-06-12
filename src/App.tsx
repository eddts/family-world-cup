import { DataStatus } from './components/DataStatus';
import { GroupTable } from './components/GroupTable';
import { KnockoutStage } from './components/KnockoutStage';
import { MatchSections } from './components/MatchSections';
import { NextMatchHero } from './components/NextMatchHero';
import { getNextFeaturedMatch, partitionMatches } from './domain/tournament';
import { useTournamentData } from './hooks/useTournamentData';

const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function App() {
  const { matches, tables, state, refresh } = useTournamentData();
  const featuredMatch = getNextFeaturedMatch(matches);
  const partitions = partitionMatches(matches);

  return (
    <main className="min-h-screen text-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:py-8">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-end">
          <div className="min-w-0">
            <p className="mb-3 inline-block border-4 border-ink bg-posterGreen px-3 py-2 font-display text-xl uppercase leading-none text-white shadow-hardSm">
              Public family sweepstake
            </p>
            <h1 className="max-w-5xl font-display text-6xl uppercase leading-none sm:text-7xl lg:text-8xl">
              Family World Cup 2026
            </h1>
          </div>
          <DataStatus state={state} onRefresh={refresh} />
        </header>

        <NextMatchHero match={featuredMatch} />

        <MatchSections title="Upcoming Matches" matches={partitions.upcoming.slice(0, 18)} />

        <MatchSections
          title="Historic Scores"
          matches={partitions.results.slice(0, 18)}
          sortDirection="desc"
        />

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-5xl uppercase leading-none sm:text-6xl">
              Groups
            </h2>
            <span className="border-4 border-ink bg-posterYellow px-3 py-2 font-display text-lg uppercase leading-none shadow-hardSm">
              League tables
            </span>
          </div>
          <div className="grid gap-5 2xl:grid-cols-2">
            {groupLetters.map((group) => (
              <GroupTable key={group} group={group} rows={tables[group] ?? []} />
            ))}
          </div>
        </section>

        <KnockoutStage title="Knockout Stage" matches={partitions.knockout} />
      </div>
    </main>
  );
}
