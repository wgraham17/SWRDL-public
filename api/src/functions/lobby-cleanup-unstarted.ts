import { differenceInHours } from 'date-fns';
import getDB from '../data';
import { Lobby } from '../models';
import { publishLobbyToAllUsers } from '../util';

export const checkLobbyForStartTimeout = async (lobby: Lobby) => {
    const db = await getDB();
    const now = new Date();
    console.debug(lobby);

    if (!lobby.hasGameStarted && differenceInHours(now, lobby.createDate) >= 24) {
        console.debug('Abandoned lobby found', 'joinKey=', lobby.joinKey, 'createDate=', lobby.createDate);
        await db.lobbyEndGame(lobby.joinKey, 'never-started');
        await publishLobbyToAllUsers(lobby.joinKey);
    }
};

export const handler = async (): Promise<void> => {
    const db = await getDB();
    const activeLobbies = await db.lobbyListActive();

    console.debug('Getting a list of active lobbies...');

    for (const lobby of activeLobbies) {
        try {
            await checkLobbyForStartTimeout(lobby);
        } catch (err) {
            console.error('Error while checking for cleanup in', lobby._id.toHexString(), lobby, err);
        }
    }
};
