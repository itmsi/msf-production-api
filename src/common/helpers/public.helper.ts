interface Pagination {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export function paginateResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Retrieve data success',
  statusCode = 200,
) {
  const pagination: Pagination = {
    total,
    page,
    limit,
    lastPage: Math.ceil(total / limit),
  };

  return {
    statusCode,
    message,
    data,
    pagination,
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // ganti spasi & underscore dengan -
    .replace(/[^\w-]+/g, '') // hapus karakter selain huruf/angka/-
    .replace(/--+/g, '-'); // hilangkan double --
}

export function getResetCountdown(expire: string) {
  const expireDate = new Date(expire);
  const now = new Date();

  const diffMs = expireDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const minutes = Math.floor(diffMs / 1000 / 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return `${minutes}m ${seconds}s remaining`;
}

export function generateSimpleNIP(id: number): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100 + Math.random() * 900);
  return `${year}${rand}${id.toString().padStart(3, '0')}`;
}
export function generateNIPWithInitial(name: string, id: number): string {
  const year = new Date().getFullYear();

  const initials = name
    .split(' ')
    .map((n) => n[0]?.toUpperCase())
    .join('')
    .substring(0, 3);

  const paddedId = id.toString().padStart(4, '0');

  const randSymbols = ['-'];
  const symbol = randSymbols[Math.floor(Math.random() * randSymbols.length)];

  return `${initials}${symbol}${paddedId}`;
}
