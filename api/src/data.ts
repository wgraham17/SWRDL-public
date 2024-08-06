import { ExpoPushReceipt } from 'expo-server-sdk';
import { MongoClient, ObjectId } from 'mongodb';
import {
    Guess,
    Lobby,
    LobbyEndReason,
    Notification,
    NotificationDeliveryStatus,
    Round,
    User,
    UserNotifications,
} from './models';

let db: Database | null = null;

const { MONGO_HOST, MONGO_DB } = process.env;
const uri = `mongodb+srv://${MONGO_HOST}/${MONGO_DB}?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&maxPoolSize=10`;

class Database {
    private readonly client: MongoClient;

    constructor() {
        this.client = new MongoClient(uri);
    }

    async connect() {
        await this.client.connect();
    }

    private get users() {
        return this.client.db().collection<User>('users');
    }

    private get lobbies() {
        return this.client.db().collection<Lobby>('lobbies');
    }

    private get notifications() {
        return this.client.db().collection<Notification>('notifications');
    }

    public async userCreate(user: User) {
        return await this.users.insertOne(user);
    }

    public async userGet(userId: string | ObjectId) {
        const _id = this.coerceObjectId(userId);
        return await this.users.findOne({ _id });
    }

    public async userGetByName(name: string) {
        return await this.users.findOne({ name });
    }

    public async userGetByToken(token: string) {
        return await this.users.findOne({ token });
    }

    public async userGetByNotificationToken(token: string) {
        return await this.users.findOne({ 'notifications.token': token });
    }

    public async userGetByEmailHash(emailHash: string) {
        return await this.users.findOne({ emailHash, emailConfirmed: true });
    }

    public async userConnect(userId: string, connectionId: string) {
        const _id = this.coerceObjectId(userId);
        return await this.users.updateOne({ _id }, { $push: { connections: connectionId } });
    }

    public async userDisconnect(connectionId: string) {
        await this.users.updateOne({ connections: connectionId }, { $pull: { connections: connectionId } });
    }

    public async userSavePreferences(userId: string | ObjectId, notifications: UserNotifications) {
        const _id = this.coerceObjectId(userId);
        await this.users.updateOne({ _id }, { $set: { notifications } });

        if (notifications.enabled && notifications.token) {
            await this.users.updateMany(
                { _id: { $ne: _id }, 'notifications.enabled': true, 'notifications.token': notifications.token },
                { $set: { notifications: { enabled: false, token: undefined } } },
            );
        }
    }

    public async userCompleteRecoverySetup(userId: string | ObjectId, emailHash: string) {
        const _id = this.coerceObjectId(userId);
        return await this.users.updateOne(
            { _id, $or: [{ emailConfirmed: false }, { emailConfirmed: { $exists: false } }] },
            { $set: { emailHash, emailConfirmed: true } },
        );
    }

    public async userUpdateToken(userId: string | ObjectId, token: string) {
        const _id = this.coerceObjectId(userId);
        await this.users.updateOne({ _id }, { $set: { token, connections: [] } });
    }

    public async lobbyCreate(lobby: Lobby) {
        return await this.lobbies.insertOne(lobby);
    }

    public async lobbyGetByJoinKey(joinKey: string) {
        return await this.lobbies.findOne({ joinKey, deleted: false });
    }

    public async lobbyDelete(joinKey: string) {
        await this.lobbies.updateOne({ joinKey }, { $set: { deleted: true } });
    }

    public async userGetLobbies(userId: string | ObjectId) {
        const user = this.coerceObjectId(userId);
        const cursor = this.lobbies.find({ users: user, deleted: false });
        return await cursor.toArray();
    }

    public async lobbyStart(joinKey: string) {
        const result = await this.lobbies.updateOne(
            { joinKey, deleted: false, hasGameStarted: false },
            { $set: { hasGameStarted: true, startDate: new Date() } },
        );

        return result.modifiedCount > 0;
    }

    public async lobbyUserJoin(joinKey: string, userId: string | ObjectId) {
        const user = this.coerceObjectId(userId);
        await this.lobbies.updateOne({ joinKey }, { $addToSet: { users: user } });
    }

    public async lobbyUserLeave(joinKey: string, userId: string | ObjectId) {
        const user = this.coerceObjectId(userId);
        await this.lobbies.updateOne({ joinKey }, { $pull: { users: user } });
    }

    public async lobbyListActive() {
        const result = this.lobbies.find({ deleted: false, hasGameStarted: true, hasGameEnded: false });
        return await result.toArray();
    }

    public async lobbyAddRound(joinKey: string, round: Round) {
        await this.lobbies.updateOne({ joinKey }, { $push: { rounds: round } });
    }

    public async lobbySetRoundWord(
        joinKey: string,
        roundSequence: number,
        providedByParticipant: ObjectId,
        word: string,
    ) {
        await this.lobbies.updateOne(
            { joinKey },
            {
                $set: {
                    'rounds.$[r].word': word,
                    'rounds.$[r].participants.$[p].isDone': true,
                },
            },
            { arrayFilters: [{ 'r.sequence': roundSequence }, { 'p.user': providedByParticipant }] },
        );
    }

    public async lobbySetParticipantWord(joinKey: string, roundSequence: number, participant: ObjectId, word: string) {
        await this.lobbies.updateOne(
            { joinKey },
            {
                $set: { 'rounds.$[r].participants.$[p].word': word },
            },
            { arrayFilters: [{ 'r.sequence': roundSequence }, { 'p.user': participant }] },
        );
    }

    public async lobbySetParticipantNotified(joinKey: string, roundSequence: number, participant: ObjectId) {
        await this.lobbies.updateOne(
            { joinKey },
            {
                $set: { 'rounds.$[r].participants.$[p].hasBeenNotified': true },
            },
            { arrayFilters: [{ 'r.sequence': roundSequence }, { 'p.user': participant }] },
        );
    }

    public async lobbyAddGuess(
        joinKey: string,
        roundSequence: number,
        participant: ObjectId,
        guess: Guess,
        isDone: boolean,
    ) {
        await this.lobbies.updateOne(
            { joinKey },
            {
                $set: { 'rounds.$[r].participants.$[p].isDone': isDone },
                $push: {
                    'rounds.$[r].participants.$[p].guesses': guess,
                },
            },
            { arrayFilters: [{ 'r.sequence': roundSequence }, { 'p.user': participant }] },
        );
    }

    public async lobbyAddInvalidWord(joinKey: string, roundSequence: number, participant: ObjectId, word: string) {
        await this.lobbies.updateOne(
            { joinKey },
            {
                $push: {
                    'rounds.$[r].participants.$[p].invalidWords': word,
                },
            },
            { arrayFilters: [{ 'r.sequence': roundSequence }, { 'p.user': participant }] },
        );
    }

    public async lobbyEndRound(joinKey: string, roundSequence: number) {
        return await this.lobbies.updateOne(
            { joinKey },
            {
                $set: {
                    'rounds.$[r].participants.$[].isDone': true,
                    'rounds.$[r].active': false,
                    'rounds.$[r].endDate': new Date(),
                },
            },
            { arrayFilters: [{ 'r.sequence': roundSequence }] },
        );
    }

    public async lobbyEndGame(joinKey: string, reason: LobbyEndReason) {
        await this.lobbies.updateOne(
            { joinKey },
            { $set: { hasGameEnded: true, endDate: new Date(), endReason: reason } },
        );
    }

    public async notificationGetPending() {
        return await this.notifications.find({ deliveryStatus: 'pending' }).toArray();
    }

    public async notificationSaveMany(items: Notification[]) {
        await this.notifications.insertMany(items);
    }

    public async notificationUpdateStatus(
        ticket: string,
        deliveryStatus: NotificationDeliveryStatus,
        receipt: ExpoPushReceipt,
    ) {
        await this.notifications.updateOne({ ticket }, { $set: { deliveryStatus, receipt } });
    }

    private coerceObjectId = (id: string | ObjectId) =>
        typeof id === 'string' ? ObjectId.createFromHexString(id) : id;
}

export default async function getDB() {
    if (db == null) {
        db = new Database();
        await db.connect();
    }

    return db;
}
