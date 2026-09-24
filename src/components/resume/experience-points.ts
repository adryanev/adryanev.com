export function experiencePoints(description: string | null): string[] {
  return description?.split(/(?<!\bSr\.)(?<=\.)\s+/).map((point) => point.trim()).filter(Boolean) ?? []
}
