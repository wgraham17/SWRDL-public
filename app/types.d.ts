import 'reactn';
import { Lobby, UserCredentials, UserInfo } from './models';

declare module 'reactn/default' {
    export interface State {
        appUser: UserCredentials | undefined;
        avatarMap: Record<string, string>;
        userInfoMap: Record<string, UserInfo>;
        lobbies: Lobby[];
        createdLobbyKey: string;
        waitingForLobbyUpdate: boolean;
        notificationsEnabled: boolean;
        hasNotificationPrompted: boolean;
        needsWelcomePrompt: boolean;
        recoveryEnabled: boolean;
        lobbyAvatars: Record<string, string>;
    }
}

declare module '*.png';
