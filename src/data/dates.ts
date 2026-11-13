import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * Publication and modification dates taken from git history at build time, so
 * `dateModified` is always true and never has to be maintained by hand.
 *
 * A shallow clone (as some CI providers default to) yields no usable history;
 * in that case the map comes back empty and every caller falls back to the
 * date declared on the page.
 */
interface Entry {
  published: string;
  modified: string;
}

function readGitDates(): Record<string, Entry> {
  const out: Record<string, Entry> = {};
  try {
    const run = (cmd: string) =>
      execSync(cmd, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    // In a shallow clone (Vercel's default) the oldest commit has no parent, so
    // git reports every file that existed then as "added" in that commit. Those
    // dates are false: without this guard every page claimed to be published and
    // modified on the day of the boundary commit. Skip boundary commits; files
    // last touched before them fall back to the dates declared on the page.
    const boundary = new Set<string>();
    try {
      if (run('git rev-parse --is-shallow-repository').trim() === 'true') {
        const shallowFile = run('git rev-parse --git-path shallow').trim();
        for (const sha of readFileSync(shallowFile, 'utf8').split('\n')) {
          if (sha.trim()) boundary.add(sha.trim());
        }
      }
    } catch {
      // not shallow, or no shallow file: nothing to skip
    }
    const raw = run('git log --pretty=format:%x01%H%x20%cI --name-only --diff-filter=AMR -- src/pages');
    for (const block of raw.split('\x01')) {
      const lines = block.split('\n').filter(Boolean);
      if (lines.length === 0) continue;
      const [sha, iso = ''] = lines[0].trim().split(' ');
      if (boundary.has(sha)) continue;
      const date = iso.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      for (const file of lines.slice(1)) {
        if (!file.startsWith('src/pages/')) continue;
        // git log walks newest first, so the first sighting is the last change
        // and the final sighting is when the file was added.
        if (!out[file]) out[file] = { published: date, modified: date };
        out[file].published = date;
      }
    }
  } catch {
    // no history available — callers fall back to their declared dates
  }
  return out;
}

const GIT_DATES = readGitDates();

function fileFor(pathname: string): string {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  return slug === '' ? 'src/pages/index.astro' : `src/pages/${slug}.astro`;
}

export interface PageDates {
  published: string;
  modified: string;
  display: string;
}

export function pageDates(pathname: string, fallback: Partial<Entry> = {}): PageDates {
  const git = GIT_DATES[fileFor(pathname)];
  const published = git?.published ?? fallback.published ?? fallback.modified ?? '';
  const modified = git?.modified ?? fallback.modified ?? fallback.published ?? '';
  const display = modified
    ? new Date(`${modified}T12:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '';
  return { published, modified, display };
}
