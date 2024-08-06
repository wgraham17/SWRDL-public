export type AuthedStackParamList = {
    Home: undefined;
    CreateGame: undefined;
    JoinGame: { joinKey: string } | undefined;
    Settings: undefined;
    Lobby: { joinKey: string };
    LobbyStats: undefined;
    EndGame: undefined;
    Round: { joinKey: string; roundSequence: number; participantId: string; isLive: boolean };
    Demo: undefined;
    HowToPlayOffer: undefined;
    RecoverySetupComplete: { token: string };
    RecoverComplete: { token: string };
};
