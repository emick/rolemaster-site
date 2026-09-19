import type { Erratum } from '../types'

export const errataKeys = {
  all: ['errata'] as const,
}

export async function getErrata(): Promise<Erratum[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/errata.json`)
  if (!response.ok) throw new Error('Erratan lataaminen epäonnistui.')
  return response.json() as Promise<Erratum[]>
}
