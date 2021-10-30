import { BlockProtocolMultiFilter } from "@hashintel/block-protocol";
import { get } from "lodash";

export const filterEntities = (
  data: any[],
  multifilter: BlockProtocolMultiFilter
) => {
  if (!multifilter) return data;

  const x = data.filter((x) => {
    const o = multifilter.filters
      .map((filter) => {
        const item = get(x, filter.field);

        if (typeof item !== "string") return null;

        switch (filter.operator) {
          case "CONTAINS":
            return item.includes(filter.value);
          case "DOES_NOT_CONTAIN":
            return !item.includes(filter.value);
          case "STARTS_WITH":
            return item.startsWith(filter.value);
          case "ENDS_WITH":
            return item.endsWith(filter.value);
          case "IS_EMPTY":
            return !item;
          case "IS_NOT_EMPTY":
            return !!item;
          case "IS":
            return item === filter.value;
          case "IS_NOT":
            return item !== filter.value;
          default:
            return null;
        }
      })
      .filter((val) => val !== null);

    if (multifilter.operator === "AND") {
      return o.every(Boolean);
    } else if (multifilter.operator === "OR") {
      return o.some(Boolean);
    }
  });
  console.log(x);
  return x;
};
