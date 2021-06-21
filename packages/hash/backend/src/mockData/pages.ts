import { DbPage } from "../types/dbTypes";

import { Visibility } from "../graphql/autoGeneratedTypes";
import { randomTimes } from "./util";

export const pages = (() => {
  
  const pageData: DbPage[] = [
    {
      id: "p1",
      type: "Page",
      namespaceId: "2",
      createdById: "2",
      ...randomTimes(),
      properties: {
        contents: [
          {
            componentId: "headerblock1",
            entityType: "Text",
            entityId: "text1",
            namespaceId: "2",
            type: "Block"
          },
          {
            componentId: "paragraphblock1",
            entityType: "Text",
            entityId: "text2",
            namespaceId: "2",
            type: "Block"
          },
          {
            componentId: "paragraphblock1",
            entityType: "Text",
            entityId: "text3",
            namespaceId: "2",
            type: "Block"
          },
          {
            componentId: "paragraphblock1",
            entityType: "Text",
            entityId: "text4",
            namespaceId: "2",
            type: "Block"
          },
        ],
        title: "Ciaran's 1st page"
      },
      visibility: Visibility.Public
    },
    {
      id: "p2",
      type: "Page",
      namespaceId: "6",
      createdById: "2",
      ...randomTimes(),
      properties: {
        contents: [
          {
            componentId: "headerblock1",
            entityType: "Text",
            entityId: "text5",
            namespaceId: "6",
            type: "Block"
          },
          {
            componentId: "paragraphblock1",
            entityType: "Text",
            entityId: "text2",
            namespaceId: "6",
            type: "Block"
          },
          {
            componentId: "paragraphblock1",
            entityType: "Text",
            entityId: "text3",
            namespaceId: "6",
            type: "Block"
          },
          {
            componentId: "paragraphblock1",
            entityType: "Text",
            entityId: "text4",
            namespaceId: "6",
            type: "Block"
          },
        ],
        title: "HASH's 1st page"
      },
      visibility: Visibility.Public
    }
  ];
  return pageData;

})();

