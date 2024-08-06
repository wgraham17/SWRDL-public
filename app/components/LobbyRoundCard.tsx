import useAppUser from '@hooks/useAppUser';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Lobby, Round } from '@root/models';
import { AuthedStackParamList } from '@root/screens/AuthedStackParamList';
import { Button, Card, Icon, Text, useStyleSheet } from '@ui-kitten/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { formatDistanceToNow, parseISO } from 'date-fns';
import LobbyMember from './LobbyMember';
import LobbyRoundCardStyles from './LobbyRoundCard.styles';

interface HeaderProps {
    title: string;
    icon: 'active' | 'won' | 'lost' | 'dnf' | 'waiting';
}

function Header({ title, icon }: HeaderProps) {
    const styles = useStyleSheet(LobbyRoundCardStyles);
    return (
        <View style={styles.headerContainer}>
            {icon === 'active' && <Icon name="arrowhead-right" style={styles.headerIcon} />}
            {icon === 'won' && <Icon name="award" style={styles.headerIcon} />}
            {icon === 'lost' && <Icon name="close" style={styles.headerIcon} />}
            {icon === 'dnf' && <Icon name="clock" style={styles.headerIcon} />}
            {icon === 'waiting' && <Icon name="clock" style={styles.headerIcon} />}
            <Text category="label">{title}</Text>
        </View>
    );
}

interface FooterProps {
    joinKey: string;
    roundSequence: number;
    participantId: string;
    expectedEndDate: string;
    allParticipantsDone: boolean;
    userDone: boolean;
    isSetup: boolean;
}

function Footer({
    joinKey,
    roundSequence,
    participantId,
    expectedEndDate,
    allParticipantsDone,
    userDone,
    isSetup,
}: FooterProps) {
    const styles = useStyleSheet(LobbyRoundCardStyles);
    const [endsIn, setEndsIn] = useState('');
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();

    useEffect(() => {
        const setLabel = () =>
            setEndsIn(
                `${allParticipantsDone ? 'Next word' : 'Ends'} ${formatDistanceToNow(parseISO(expectedEndDate), {
                    includeSeconds: true,
                    addSuffix: true,
                })}`,
            );

        const updateEndDate = setInterval(() => {
            if (parseISO(expectedEndDate) < new Date()) {
                setEndsIn('');
                clearInterval(updateEndDate);
            } else {
                setLabel();
            }
        }, 1000);

        setLabel();
        return () => clearInterval(updateEndDate);
    }, [expectedEndDate, allParticipantsDone]);

    const ctaTitle = isSetup ? 'Pick Word' : 'Play!';

    return (
        <View style={styles.footerContainer}>
            <Text category="c1">{endsIn}</Text>
            {!userDone && (
                <Button
                    onPress={() => navigation.push('Round', { joinKey, roundSequence, participantId, isLive: true })}
                >
                    {ctaTitle}
                </Button>
            )}
        </View>
    );
}

interface Props {
    lobby: Lobby;
    round: Round;
    collapsed?: boolean | undefined;
    isHistory?: boolean | undefined;
}

function LobbyRoundCard({ lobby, round, collapsed, isHistory }: Props) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthedStackParamList>>();
    const styles = useStyleSheet(LobbyRoundCardStyles);
    const { appUser } = useAppUser();
    const userParticipant = round.participants.find(p => p.user === appUser?.id);
    const handlePress = useCallback(
        (participantId: string) => {
            const targetParticipant = round.participants.find(p => p.user === participantId);
            if (!targetParticipant) return;

            navigation.push('Round', {
                joinKey: lobby.joinKey,
                roundSequence: round.sequence,
                participantId,
                isLive: round.active && !targetParticipant.isDone,
            });
        },
        [lobby, round, navigation],
    );
    const canViewGuesses = !userParticipant || userParticipant.isDone;
    const allParticipantsDone = round.participants.every(p => p.isDone);
    const usersNotInRound = round.active ? lobby.users.filter(u => !round.participants.some(p => p.user === u.id)) : [];
    const isPlayable = userParticipant?.status === 'ROUND_SETUP_SELF' || userParticipant?.status === 'ROUND_ACTIVE';

    const headerProps = useMemo((): HeaderProps => {
        let title = `Round ${round.sequence}`;
        let word = round.word?.toUpperCase();

        if (lobby?.gameRules?.wordSource === 'pvp') {
            word = round.participants.map(p => p.word?.toUpperCase()).join(' / ');
        }

        if (!round.active) {
            title += ` - ${word}`;
        }

        if (!userParticipant) {
            if (round.active) return { title, icon: 'waiting' };

            return { title, icon: 'waiting' };
        }

        const winningGuess = userParticipant.guesses.findIndex(g => g.mask === '33333');
        if (winningGuess > -1) {
            return { title, icon: 'won' };
        }

        if (round.active) {
            return { title, icon: 'active' };
        }

        if (userParticipant.guesses.length === 6) {
            return { title, icon: 'lost' };
        }

        return { title, icon: 'dnf' };
    }, [lobby, round, userParticipant]);

    const header = useMemo(() => <Header {...headerProps} />, [headerProps]);
    const footer = useMemo(
        () =>
            userParticipant && !isHistory && isPlayable ? (
                <Footer
                    joinKey={lobby.joinKey}
                    roundSequence={round.sequence}
                    participantId={userParticipant?.user}
                    expectedEndDate={round.expectedEndDate}
                    userDone={userParticipant.isDone}
                    allParticipantsDone={allParticipantsDone}
                    isSetup={userParticipant.status === 'ROUND_SETUP_SELF'}
                />
            ) : undefined,
        [lobby, round, userParticipant, allParticipantsDone, isHistory, isPlayable],
    );

    if (!appUser || !lobby) return null;

    return (
        <Card disabled style={styles.card} header={header} footer={footer}>
            {!collapsed &&
                round.participants.map(u => (
                    <RectButton key={u.user} enabled={canViewGuesses} onPress={() => handlePress(u.user)}>
                        <LobbyMember id={u.user} participant={u} isSelf={appUser.id === u.user} key={u.user} />
                    </RectButton>
                ))}
            {!collapsed && usersNotInRound.map(u => <LobbyMember id={u.id} isSelf={appUser.id === u.id} key={u.id} />)}
        </Card>
    );
}

LobbyRoundCard.defaultProps = {
    collapsed: false,
    isHistory: false,
};

export default LobbyRoundCard;
