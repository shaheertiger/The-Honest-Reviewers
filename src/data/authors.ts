export const SITE_URL = 'https://www.thehonestreviewers.com';

export interface Author {
  slug: string;
  name: string;
  role: string;
  short: string;
  bio: string[];
  initials: string;
  beat: string[];
}

export const AUTHORS: Record<string, Author> = {
  'alex-rivers': {
    slug: 'alex-rivers',
    name: 'Alex Rivers',
    role: 'Home Improvement Editor',
    initials: 'AR',
    short:
      'Alex has spent over a decade working on residential and light commercial property maintenance, and now tests every tool, coating and machine that appears in these guides personally.',
    bio: [
      'Alex Rivers is the Home Improvement Editor at The Honest Reviewers, where he runs the testing programme for outdoor power equipment, driveway and masonry coatings, garage flooring, and household tools.',
      'Before joining the site he spent more than a decade maintaining residential and light commercial properties — sealing driveways, coating garage floors, running pressure washers hard enough to kill several of them, and learning which products fail in the second season rather than the first. Most of the strong opinions in these guides come from that period rather than from a spec sheet.',
      'He tests products on real surfaces and real jobs, keeps machines long enough to see how they age, and returns or buys what he tests. He does not accept payment for coverage, and manufacturers do not see a guide before it is published.',
    ],
    beat: [
      'Outdoor power equipment',
      'Driveway and masonry sealers',
      'Garage flooring and coatings',
      'Pressure washers and cleaning gear',
      'Home backup power',
    ],
  },
};

export const DEFAULT_AUTHOR = 'alex-rivers';

export function authorSchema(slug: string = DEFAULT_AUTHOR) {
  const a = AUTHORS[slug] ?? AUTHORS[DEFAULT_AUTHOR];
  return {
    '@type': 'Person',
    name: a.name,
    url: `${SITE_URL}/authors/${a.slug}/`,
    jobTitle: a.role,
    worksFor: { '@type': 'Organization', name: 'The Honest Reviewers', url: SITE_URL },
    knowsAbout: a.beat,
  };
}
