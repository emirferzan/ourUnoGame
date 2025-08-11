const images = import.meta.glob('../assets/cards/*.png', { eager: true, as: 'url' }) as Record<string, string>;

export function getCardImage(color: string, rank: string): string | undefined {
  const key = `../assets/cards/${color}_${rank}.png`;
  return images[key];
}

export const backImage: string | undefined = images['../assets/cards/back.png'];