export const espnScoreboardFixture = {
  events: [
    {
      id: '760415',
      date: '2026-06-11T19:00Z',
      season: { slug: 'group-stage' },
      competitions: [
        {
          altGameNote: 'FIFA World Cup, Group A',
          venue: { fullName: 'Estadio Banorte' },
          status: {
            type: {
              state: 'post',
              completed: true,
            },
          },
          competitors: [
            {
              homeAway: 'home',
              score: '2',
              team: {
                id: '203',
                displayName: 'Mexico',
                abbreviation: 'MEX',
                logo: 'https://a.espncdn.com/i/teamlogos/countries/500/mex.png',
                isActive: true,
              },
            },
            {
              homeAway: 'away',
              score: '0',
              team: {
                id: '467',
                displayName: 'South Africa',
                abbreviation: 'RSA',
                logo: 'https://a.espncdn.com/i/teamlogos/countries/500/rsa.png',
                isActive: true,
              },
            },
          ],
        },
      ],
    },
    {
      id: '760517',
      date: '2026-07-19T19:00Z',
      season: { slug: 'final' },
      competitions: [
        {
          altGameNote: 'FIFA World Cup',
          venue: { fullName: 'MetLife Stadium' },
          status: {
            type: {
              state: 'pre',
              completed: false,
            },
          },
          competitors: [
            {
              homeAway: 'home',
              score: '0',
              team: {
                id: '5960',
                displayName: 'Semifinal 1 Winner',
                abbreviation: 'SF W1',
                logo: '',
                isActive: false,
              },
            },
            {
              homeAway: 'away',
              score: '0',
              team: {
                id: '5961',
                displayName: 'Semifinal 2 Winner',
                abbreviation: 'SF W2',
                logo: '',
                isActive: false,
              },
            },
          ],
        },
      ],
    },
  ],
};
