import { Radio, RadioGroup, Text } from '@ui-kitten/components';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

export interface Option {
    name: string;
    value: string;
    helpText?: string | undefined;
}

interface Props {
    options: Option[];
    selectedOption: Option | undefined;
    onChange: (val: Option) => void;
}

function CustomRadioGroup({ options, selectedOption, onChange }: Props) {
    const selectedIndex = useMemo(() => {
        if (!selectedOption) return undefined;
        return options.findIndex(o => o.value === selectedOption.value);
    }, [options, selectedOption]);

    const setSelectedIndex = useCallback(
        (index: number) => {
            onChange(options[index]);
        },
        [onChange, options],
    );

    return (
        <RadioGroup selectedIndex={selectedIndex} onChange={index => setSelectedIndex(index)}>
            {options.map(opt => (
                <Radio key={opt.value}>
                    <View>
                        <Text category="c2">{opt.name}</Text>
                        {opt.helpText && (
                            <Text category="c1" appearance="hint">
                                {opt.helpText}
                            </Text>
                        )}
                    </View>
                </Radio>
            ))}
        </RadioGroup>
    );
}

export default CustomRadioGroup;
