import "@glideapps/glide-data-grid/dist/index.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { GridCellKind, GridColumn } from "@glideapps/glide-data-grid";
import {
  Chip,
  FontAwesomeIcon,
  IconButton,
} from "@hashintel/hash-design-system";
import { Box, Container, Paper, Stack } from "@mui/material";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { extractBaseUri } from "@blockprotocol/type-system-web";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import { GlideGrid } from "../../../../../components/GlideGlid/glide-grid";
import { GlideGridOverlayPortal } from "../../../../../components/GlideGlid/glide-grid-overlay-portal";
import {
  createHandleHeaderClicked,
  sortRowData,
  TableSort,
} from "../../../../../components/GlideGlid/utils/sorting";
import { useDrawHeader } from "../../../../../components/GlideGlid/utils/use-draw-header";
import { usePropertyTypes } from "../use-property-types";
import { parseEntityIdentifier } from "../../../../../lib/entities";
import { Entity } from "../../../../../components/hooks/blockProtocolFunctions/knowledge/knowledge-shim";
import { useAccounts } from "../../../../../components/hooks/useAccounts";
import { SectionWrapper } from "../../../shared/section-wrapper";
import { WhiteChip } from "../../../shared/white-chip";
import { blankCell } from "../../../../../components/GlideGlid/utils";
import { mustBeVersionedUri } from "../util";
import { HomeIcon } from "../../../../../shared/icons/home-icon";
import { EarthIcon } from "../../../../../shared/icons/earth-icon";
import { renderValueIconCell } from "./value-icon-cell";

export const generateEntityLabel = (
  entity: Entity,
  propertyTypes: PropertyType[],
  schema?: { labelProperty?: unknown; title?: unknown },
): string => {
  // if the schema has a labelProperty set, prefer that
  const labelProperty = schema?.labelProperty;
  if (
    typeof labelProperty === "string" &&
    typeof entity.properties[labelProperty] === "string" &&
    entity.properties[labelProperty]
  ) {
    return entity.properties[labelProperty] as string;
  }

  // fallback to some likely display name properties
  const options = [
    "name",
    "preferred name",
    "display name",
    "title",
    "shortname",
  ];

  const propertyTypes2: { title?: string; propertyTypeBaseUri: string }[] =
    Object.keys(entity.properties).map((propertyTypeBaseUri) => {
      /** @todo - pick the latest version rather than first element? */

      const propertyType = Object.values(propertyTypes).find(
        (prop) =>
          extractBaseUri(mustBeVersionedUri(prop.$id)) === propertyTypeBaseUri,
      );
      // const [propertyType] = getPropertyTypesByBaseUri(
      //   rootEntityAndSubgraph.subgraph,
      //   propertyTypeBaseUri,
      // );

      return propertyType
        ? {
            title: propertyType.title.toLowerCase(),
            propertyTypeBaseUri,
          }
        : {
            title: undefined,
            propertyTypeBaseUri,
          };
    });

  for (const option of options) {
    const found = propertyTypes2.find(({ title }) => title === option);

    if (found) {
      return entity.properties[found.propertyTypeBaseUri];
    }
  }

  // fallback to the entity type and a few characters of the entityId
  let entityId = entity.entityId;
  try {
    // in case this entityId is a stringified JSON object, extract the real entityId from it
    ({ entityId } = parseEntityIdentifier(entityId));
  } catch {
    // entityId was not a stringified object, it was already the real entityId
  }

  const entityTypeName = schema?.title ?? "Entity";

  return `${entityTypeName}-${entityId.slice(0, 5)}`;
};

export type EntitiesTabProps = {
  entities: Entity[];
  entityType: EntityType;
  namespace: {
    id: string;
    shortname: string;
  };
};

export const EntitiesTab: FunctionComponent<EntitiesTabProps> = ({
  entities,
  entityType,
  namespace,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [tableSort, setTableSort] = useState<TableSort<string>>({
    key: "entity",
    dir: "desc",
  });

  const { accounts } = useAccounts();

  const propertyTypes = usePropertyTypes();

  const generateNameSpace = useCallback(
    (ownedById: string) =>
      accounts?.find(({ entityId }) => entityId === ownedById)?.shortname,
    [accounts],
  );

  const [columns, rows] = useMemo(() => {
    const propertyColumns =
      propertyTypes && entityType
        ? Object.keys(entityType.properties).reduce<GridColumn[]>(
            (columns, propertyId) => {
              const propertyType = Object.values(propertyTypes).find(
                (prop) =>
                  extractBaseUri(mustBeVersionedUri(prop.$id)) === propertyId,
              );

              if (propertyType) {
                return [
                  ...columns,
                  {
                    title: propertyType.title,
                    id: propertyId,
                    width: 200,
                  },
                ];
              }

              return columns;
            },
            [],
          )
        : [];

    const columns: GridColumn[] = [
      {
        title: "Entity",
        id: "entity",
        width: 200,
        grow: 1,
      },
      {
        title: "Namespace",
        id: "namespace",
        width: 200,
      },
      {
        title: "Additional Types",
        id: "additionalTypes",
        width: 200,
      },
      ...propertyColumns,
    ];

    const rows: { [k: string]: string }[] =
      (propertyTypes &&
        entities?.map((entity) => {
          const entityLabel = generateEntityLabel(entity, propertyTypes);
          const namespace = generateNameSpace(entity.ownedById);

          return {
            entity: entityLabel,
            namespace: namespace ? `@${namespace}` : "",
            additionalTypes: "",
            ...propertyColumns.reduce((fields, column) => {
              if (column.id) {
                const propertyValue = entity.properties[column.id];

                const value = Array.isArray(propertyValue)
                  ? propertyValue.join(", ")
                  : propertyValue;
                return { ...fields, [column.id]: value };
              }

              return fields;
            }, {}),
          };
        })) ??
      [];

    return [columns, rows];
  }, [entityType, propertyTypes, entities, generateNameSpace]);

  const entitiesCount = useMemo(() => {
    const namespaceEntities =
      entities?.filter((entity) => entity.ownedById === namespace.id) ?? [];

    return {
      namespace: namespaceEntities.length,
      public: (entities?.length ?? 0) - namespaceEntities.length,
    };
  }, [entities, namespace]);

  const drawHeader = useDrawHeader(tableSort, columns);

  const handleHeaderClicked = createHandleHeaderClicked(
    columns,
    tableSort,
    setTableSort,
  );

  const sortedRows = rows && sortRowData(rows, tableSort);

  if (!entities || !propertyTypes || !entityType) {
    return null;
  }

  return (
    <Container>
      <Box sx={{ paddingX: 2.5 }}>
        <SectionWrapper
          title="Entities"
          titleTooltip="This table lists all entities with the ‘Company’ type that are accessible to you"
          titleStartContent={
            <Stack direction="row">
              {entitiesCount.namespace || entitiesCount.public ? (
                <Stack direction="row" spacing={1.5} mr={2}>
                  {entitiesCount.namespace ? (
                    <Chip
                      size="xs"
                      label={`${entitiesCount.namespace} in @${namespace.shortname}`}
                      icon={<HomeIcon />}
                      sx={({ palette }) => ({ color: palette.gray[70] })}
                    />
                  ) : null}

                  {entitiesCount.public ? (
                    <WhiteChip
                      size="xs"
                      label={`${entitiesCount.public} public`}
                      icon={<EarthIcon />}
                    />
                  ) : null}
                </Stack>
              ) : null}

              <Stack direction="row" spacing={0.5}>
                <IconButton
                  rounded
                  onClick={() => setShowSearch(true)}
                  sx={{ color: ({ palette }) => palette.gray[60] }}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </IconButton>
              </Stack>
            </Stack>
          }
          tooltipIcon={
            <FontAwesomeIcon icon={faCircleQuestion} sx={{ fontSize: 14 }} />
          }
        >
          <Paper sx={{ overflow: "hidden" }}>
            <GlideGrid
              showSearch={showSearch}
              onSearchClose={() => setShowSearch(false)}
              onHeaderClicked={handleHeaderClicked}
              drawHeader={drawHeader}
              columns={columns}
              rows={sortedRows.length}
              getCellContent={([colIndex, rowIndex]) => {
                if (sortedRows && columns) {
                  const row = sortedRows[rowIndex];
                  const objKey = columns[colIndex]?.id;
                  const cellValue = row?.[objKey];

                  if (objKey === "entity") {
                    return {
                      kind: GridCellKind.Custom,
                      allowOverlay: false,
                      readonly: true,
                      copyData: cellValue,
                      data: {
                        kind: "value-icon-cell",
                        icon: "faAsterisk",
                        value: cellValue,
                      },
                    };
                  }

                  if (cellValue) {
                    return {
                      kind: GridCellKind.Text,
                      allowOverlay: false,
                      readonly: true,
                      copyData: cellValue,
                      displayData: cellValue,
                      data: cellValue,
                    };
                  }
                }
                return blankCell;
              }}
              customRenderers={[renderValueIconCell]}
            />
          </Paper>
        </SectionWrapper>
        <GlideGridOverlayPortal />
      </Box>
    </Container>
  );
};
