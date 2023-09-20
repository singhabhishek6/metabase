/* eslint-disable react/prop-types */
import type {SearchSidebarFilterComponent} from "metabase/search/types";
import {CreatedAtFilter} from "metabase/search/components/filters/CreatedAtFilter/CreatedAtFilter";
import {Text} from "metabase/ui"
import {getFilterTitle} from "metabase/parameters/utils/date-formatting";

export const CreatedAtDisplay: SearchSidebarFilterComponent<"created_at">["DisplayComponent"] = (
  {
    value,
  }) => {
  console.log(value, value && getFilterTitle(value[0]))
  return <Text>{value ? getFilterTitle(value) : CreatedAtFilter.title}</Text>
}