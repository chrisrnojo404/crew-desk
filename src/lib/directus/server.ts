type DirectusFetchSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

type DirectusFetchFailure = {
  ok: false;
  status: number;
  message?: string;
};

export async function directusFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<DirectusFetchSuccess<T> | DirectusFetchFailure> {
  const baseUrl = process.env.DIRECTUS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: payload?.errors?.[0]?.message ?? payload?.message
    };
  }

  return { ok: true, status: response.status, data: payload as T };
}
