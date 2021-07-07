import { ApolloError } from "apollo-server-express";

import { DbUnknownEntity } from "../../../types/dbTypes";
import { MutationUpdateEntityArgs, Resolver } from "../../autoGeneratedTypes";
import { GraphQLContext } from "../../context";

export const updateEntity: Resolver<
  Promise<DbUnknownEntity>,
  {},
  GraphQLContext,
  MutationUpdateEntityArgs
> = async (_, { namespaceId, id, properties }, { dataSources }) => {
  // TODO: doing a select & update for now. See if just update is possible, if not,
  // need to use a transaction

  const entity = await dataSources.db.getEntity({ namespaceId, id });
  if (!entity) {
    throw new ApolloError(
      `Entity ${id} does not exist in namespace ${namespaceId}`,
      "NOT_FOUND"
    );
  }

  // Temporary hack - need to figure out how clients side property updates properly. How do they update things on the root entity, e.g. type?
  const propertiesToUpdate = properties.properties ?? properties;

  // Temporary hack to make sure property updates don't overwrite linkedData
  // with the resolved entity
  for (const key of Object.keys(propertiesToUpdate)) {
    if (entity.properties[key as keyof DbUnknownEntity]?.__linkedData) {
      delete propertiesToUpdate[key];
    }
  }

  entity.properties = propertiesToUpdate;

  const updatedEntity = await dataSources.db.updateEntity({
    namespaceId,
    id,
    properties: propertiesToUpdate,
  });
  if (!updatedEntity) {
    throw new ApolloError(
      `Entity ${id} does not exist in namespace ${namespaceId}`,
      "NOT_FOUND"
    );
  }

  return updatedEntity as DbUnknownEntity;
};
