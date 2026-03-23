export type SignalMetric = {
  label: string;
  value: number;
  unit: string;
  title?: string | null;
};

export type SignalsResponse = {
  user: {
    id: string;
    username: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
  builderSignal: SignalMetric;
  learningSignal: SignalMetric;
  struggleSignal: SignalMetric;
  topLearningTopics: string[];
};

export type BuildMapSignalType = 'BUILDING' | 'LEARNING' | 'STRUGGLING';
export type BuildMapVisualKind =
  | BuildMapSignalType
  | 'MIXED'
  | 'NONE';

export type BuildMapDay = {
  date: string;
  hasSignal: boolean;
  entry?: {
    signalTypes: BuildMapSignalType[];
    totalSignals: number;
    visualKind: BuildMapVisualKind;
    postIds: string[];
    latestSignalAt: string | null;
  } | null;
};

export type BuildMapResponse = {
  user: {
    id: string;
    username: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
  range: {
    days: number;
    from: string;
    to: string;
  };
  days: BuildMapDay[];
  legend: Record<string, string>;
};
