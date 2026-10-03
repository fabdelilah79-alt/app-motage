const pad = (value: number): string => String(value).padStart(2, '0');

/** Transforme un titre en nom de fichier sûr (sans accents ni espaces). */
export const slugify = (title: string): string =>
  title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Nom du fichier MP4 exporté, ex. « la-chute-libre_2026-10-03_14-05-09.mp4 ». */
export const buildOutputFileName = (title: string, date: Date): string => {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  return `${slugify(title) || 'video'}_${day}_${time}.mp4`;
};
