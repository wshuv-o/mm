// import { Triggers, UseMentionsConfig } from '@/packages/rte/src';
import { TextInputProps } from 'react-native';
import { Triggers, UseMentionsConfig } from 'types/types';

type MentionInputProps<TriggerName extends string> = Omit<TextInputProps, 'onChange'> &
  UseMentionsConfig<TriggerName> & {
    onTriggersChange?: (triggers: Triggers<TriggerName>) => void;
  };

export { MentionInputProps };
