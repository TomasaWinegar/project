import { AxiosError } from "axios";
import { PropertyType } from "@blockprotocol/type-system-web";

import {
  GraphApi,
  PersistedPropertyType,
  UpdatePropertyTypeRequest,
} from "@hashintel/hash-graph-client";
import { generateTypeId } from "@hashintel/hash-shared/types";
import { PropertyTypeModel } from "../index";
import { extractBaseUri } from "../util";
import { getNamespaceOfAccountOwner } from "./util";

type PropertyTypeModelConstructorParams = {
  ownedById: string;
  schema: PropertyType;
};

/**
 * @class {@link PropertyTypeModel}
 */
export default class {
  ownedById: string;

  schema: PropertyType;

  constructor({ schema, ownedById }: PropertyTypeModelConstructorParams) {
    this.ownedById = ownedById;
    this.schema = schema;
  }

  static fromPersistedPropertyType({
    inner,
    metadata: { identifier },
  }: PersistedPropertyType): PropertyTypeModel {
    /**
     * @todo and a warning, these type casts are here to compensate for
     *   the differences between the Graph API package and the
     *   type system package.
     *
     *   The type system package can be considered the source of truth in
     *   terms of the shape of values returned from the API, but the API
     *   client is unable to be given as type package types - it generates
     *   its own types.
     *   https://app.asana.com/0/1202805690238892/1202892835843657/f
     */
    return new PropertyTypeModel({
      schema: inner as PropertyType,
      ownedById: identifier.ownedById,
    });
  }

  /**
   * Create a property type.
   *
   * @param params.ownedById - the id of the owner of the property type
   * @param params.schema - the `PropertyType`
   * @param params.createdById - the id of the account that is creating the property type
   */
  static async create(
    graphApi: GraphApi,
    params: {
      ownedById: string;
      schema: Omit<PropertyType, "$id">;
      createdById: string;
    },
  ): Promise<PropertyTypeModel> {
    const { ownedById, createdById } = params;

    const namespace = await getNamespaceOfAccountOwner(graphApi, {
      ownerId: ownedById,
    });

    const propertyTypeId = generateTypeId({
      namespace,
      kind: "property-type",
      title: params.schema.title,
    });

    const fullPropertyType = { $id: propertyTypeId, ...params.schema };

    const { data: metadata } = await graphApi
      .createPropertyType({
        ownedById,
        schema: fullPropertyType,
        createdById,
      })
      .catch((err: AxiosError) => {
        throw new Error(
          err.response?.status === 409
            ? `property type with the same URI already exists. [URI=${fullPropertyType.$id}]`
            : `[${err.code}] couldn't create property type: ${err.response?.data}.`,
        );
      });

    const { identifier } = metadata;

    return new PropertyTypeModel({
      schema: fullPropertyType,
      ownedById: identifier.ownedById,
    });
  }

  /**
   * Get a property type by its versioned URI.
   *
   * @param params.propertyTypeId the unique versioned URI for a property type.
   */
  static async get(
    graphApi: GraphApi,
    params: {
      propertyTypeId: string;
    },
  ): Promise<PropertyTypeModel> {
    const { propertyTypeId } = params;
    const { data: persistedPropertyType } = await graphApi.getPropertyType(
      propertyTypeId,
    );

    return PropertyTypeModel.fromPersistedPropertyType(persistedPropertyType);
  }

  /**
   * Update a property type.
   *
   * @param params.schema - the updated `PropertyType`
   * @param params.updatedById - the id of the account that is updating the type
   */
  async update(
    graphApi: GraphApi,
    params: {
      schema: Omit<PropertyType, "$id">;
      updatedById: string;
    },
  ): Promise<PropertyTypeModel> {
    const { schema, updatedById } = params;
    const updateArguments: UpdatePropertyTypeRequest = {
      typeToUpdate: this.schema.$id,
      schema,
      updatedById,
    };

    const { data: metadata } = await graphApi.updatePropertyType(
      updateArguments,
    );

    const { identifier } = metadata;

    return new PropertyTypeModel({
      schema: { ...schema, $id: identifier.uri },
      ownedById: identifier.ownedById,
    });
  }

  get baseUri() {
    return extractBaseUri(this.schema.$id);
  }
}
