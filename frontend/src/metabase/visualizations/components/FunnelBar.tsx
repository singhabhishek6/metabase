import { BarChart } from "metabase/visualizations/visualizations/BarChart";

import { getComputedSettingsForSeries } from "metabase/visualizations/lib/settings/visualization";
import type { VisualizationProps } from "metabase/visualizations/types";

export const FunnelBar = (props: VisualizationProps) => {
  const [funnelSeries] = props.rawSeries;

  const barCard = {
    ...funnelSeries.card,
    display: "bar",
    visualization_settings: {
      "graph.dimensions": [props.settings["funnel.dimension"]],
      "graph.metrics": [props.settings["funnel.metric"]],
      series_settings: {
        [props.settings["funnel.metric"]]: {
          display: "bar",
        },
      },
    },
  };

  const barSeries = [
    {
      ...funnelSeries,
      card: barCard,
    },
  ];

  const settings = getComputedSettingsForSeries(barSeries);

  return <BarChart {...props} rawSeries={barSeries} settings={settings} />;
};
