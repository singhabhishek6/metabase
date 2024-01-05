import { t } from "ttag";
import type { RawSeries, SingleSeries, XAxisScale } from "metabase-types/api";
import { TYPE } from "metabase-lib/types/constants";
import { getColorsForValues } from "metabase/lib/colors/charts";
import { getComputedSettingsForSeries } from "metabase/visualizations/lib/settings/visualization";

export const transformCombinedScalarSeries = (
  singleSeries: SingleSeries,
): SingleSeries => {
  const { card, data } = singleSeries;

  const transformedDataset = {
    ...data,
    cols: [
      {
        base_type: TYPE.Text,
        display_name: t`Name`,
        name: "name",
        source: "query-transform",
      },
      { ...data.cols[0] },
    ],
    rows: [[card.name, data.rows[0][0]]],
  };

  const transformedCard = {
    ...card,
    display: "bar",
    visualization_settings: {
      // "graph.y_axis.scale": "linear",
      // "graph.x_axis.scale": "ordinal",
      "graph.x_axis.labels_enabled": false,
      "stackable.stack_type": "stacked",
      "graph.dimensions": [transformedDataset.cols[0].name],
      "graph.metrics": [transformedDataset.cols[1].name],
    },
  };

  return {
    card: transformedCard,
    data: transformedDataset,
  };
};

export const transformCombinedScalarsSeries = (scalarSeries: RawSeries) => {
  const barSeries = scalarSeries.map(transformCombinedScalarSeries);

  const settings = getComputedSettingsForSeries(barSeries);
  // const colors = getColorsForValues(rawSeries.map(({ card }) => card.name));
  return {
    barSeries,
    settings,
  };
};

// title?: string;
// color?: string;
// show_series_values?: boolean;
// display?: string;
// axis?: string;
// "line.interpolate"?: string;
// "line.marker_enabled"?: boolean;
// "line.missing"?: string;
