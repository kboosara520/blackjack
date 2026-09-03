export const GamePhase = {
    Betting: "betting",
    Dealing: "dealing",
    PlayerTurn: "player_turn",
    DealerTurn: "dealer_turn",
    Complete: "complete"
}
export type GamePhase = typeof GamePhase[keyof typeof GamePhase];