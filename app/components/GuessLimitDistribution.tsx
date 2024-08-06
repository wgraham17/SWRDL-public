import { AttemptStats } from '@root/models';
import { useTheme } from '@ui-kitten/components';
import { memo, useMemo, useState } from 'react';
import { LayoutRectangle, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChartConfig, ChartData } from 'react-native-chart-kit/dist/HelperTypes';

interface Props {
    guessAttempts: AttemptStats[];
    guessLimit?: number | undefined;
}

function GuessLimitDistribution({ guessAttempts, guessLimit }: Props) {
    const [graphSize, setGraphSize] = useState<LayoutRectangle>();
    const primaryColor = useTheme()['color-primary-500'];
    const textColor = useTheme()['text-basic-color'];

    const chartData = useMemo((): ChartData => {
        let [maxGuessNumber] = guessAttempts.map(s => s.guessNumber).sort((a, b) => b - a);

        if (maxGuessNumber > 10) {
            maxGuessNumber = Math.ceil(maxGuessNumber / 5) * 5;
        } else if (guessLimit) {
            maxGuessNumber = guessLimit;
        }

        const guessDistributionRange = Array.from({ length: maxGuessNumber }, (_, k) => k + 1);
        let labels: string[] = [];

        if (guessDistributionRange.length > 10) {
            labels.push(`${guessDistributionRange[0]}`, ``, ``, ``);

            for (let curLabel = 4; curLabel < guessDistributionRange.length - 5; curLabel += 5) {
                labels.push(`${guessDistributionRange[curLabel]}`, ``, ``, ``, ``);
            }

            labels.push(...Array.from({ length: guessDistributionRange.length - labels.length - 1 }, () => ''));
            labels.push(...guessDistributionRange.slice(-1).map(v => `${v}`));
        } else {
            labels = guessDistributionRange.map(v => `${v}`);
        }

        return {
            labels,
            datasets: [
                {
                    data: guessDistributionRange.map(
                        d => guessAttempts.find(g => g.guessNumber === +d)?.timesWonAtGuessNumber || 0,
                    ),
                    strokeWidth: 2,
                    color: () => primaryColor,
                },
            ],
        };
    }, [guessAttempts, guessLimit, primaryColor]);

    const chartConfig = useMemo(
        (): ChartConfig => ({
            backgroundColor: 'transparent',
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            color: () => textColor,
            barPercentage: 1,
        }),
        [textColor],
    );

    return (
        <View style={{ alignSelf: 'stretch' }} onLayout={e => setGraphSize(e.nativeEvent.layout)}>
            {graphSize && (
                <BarChart
                    data={chartData}
                    width={graphSize?.width}
                    height={180}
                    chartConfig={chartConfig}
                    withInnerLines={false}
                    showValuesOnTopOfBars
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix=""
                />
            )}
        </View>
    );
}

GuessLimitDistribution.defaultProps = {
    guessLimit: undefined,
};

export default memo(GuessLimitDistribution);
