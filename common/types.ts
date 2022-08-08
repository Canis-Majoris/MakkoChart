// API Globals
export interface Looker {
  plugins: {
    visualizations: {
      add: (visualization: VisualizationDefinition) => void;
    };
  };
}

export interface Crossfilter {
  field: string;
  values: string[];
  range?: [string, string];
}

export interface VisualizationDefinition {
  id?: string;
  label?: string;
  options: any;
  addError?: (error: any) => void;
  clearErrors?: (errorName?: string) => void;
  create: (element: HTMLElement, settings: VisConfig) => void;
  onCrossfilter?: (crossfilters: Crossfilter[], event: Event | null) => void;
  trigger?: (event: string, config: object[]) => void;
  update?: (
    data: any,
    element: HTMLElement,
    config: VisConfig,
    queryResponse: any,
    details?: VisUpdateDetails
  ) => void;
  updateAsync?: (
    data: any,
    element: HTMLElement,
    config: VisConfig,
    queryResponse: any,
    details: VisUpdateDetails | undefined,
    updateComplete: () => void
  ) => void;
  destroy?: () => void;
}

export interface VisConfig {
  [key: string]: VisConfigValue;
}

export type VisConfigValue = any;

export interface VisUpdateDetails {
  changed: {
    config?: string[];
    data?: boolean;
    queryResponse?: boolean;
    size?: boolean;
  };
}

export interface ChartConfig {
  xAxis: {
    type?: string;
    suffix?: string;
    prefix?: string;
  };
  value: {
    prefix?: string;
    suffix?: string;
  };
}
