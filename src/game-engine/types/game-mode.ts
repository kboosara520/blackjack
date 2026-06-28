export const GameMode = {
    Normal: "normal",
    Practice: "practice"
} as const;
export type GameMode = typeof GameMode[keyof typeof GameMode];