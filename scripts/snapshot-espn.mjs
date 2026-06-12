import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const url =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';

const outputPath = resolve('src/data/fallbackEspnScoreboard.json');

const response = await fetch(url);

if (!response.ok) {
  throw new Error(`ESPN snapshot request failed with ${response.status}`);
}

const payload = await response.json();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
