import {
  BaseUri,
  VersionedUri,
  validateBaseUri as validateBaseUriGraphApi,
  validateVersionedUri as validateVersionedUriGraphApi,
} from "@blockprotocol/type-system-web";

/**
 * @todo - we are patching these so this package can be used in node and web environments. When we unify the packages
 *   this will no longer be necessary return types / functionality may differ a bit in the meantime, these are just
 *   hotfixes.
 *   https://app.asana.com/0/1201095311341924/1202923896339225/f
 *
 * */

const versionedUriGroupsPattern = /(.+\/)v\/(\d+)(.*)/;

export const splitVersionedUri = (id: VersionedUri): [BaseUri, number] => {
  const [_, baseUri, version] = id.match(versionedUriGroupsPattern)!;
  return [baseUri!, Number(version)];
};

export const versionedUriFromComponents = (
  baseUri: BaseUri,
  version: number,
): VersionedUri => {
  return `${baseUri}v/${version}` as VersionedUri;
};

export const extractBaseUri = (id: VersionedUri): BaseUri => {
  return splitVersionedUri(id)[0];
};

export const extractVersion = (id: VersionedUri): number => {
  return splitVersionedUri(id)[1];
};

export const validateBaseUri = (
  uri: string,
): ReturnType<typeof validateBaseUriGraphApi> => {
  try {
    const _ = new URL(uri);
    return {
      type: "Ok",
      inner: uri,
    };
  } catch {
    return {
      type: "Err",
      inner: { reason: "UrlParseError", inner: "" },
    };
  }
};

export const validateVersionedUri = (
  uri: string,
): ReturnType<typeof validateVersionedUriGraphApi> => {
  try {
    const _ = new URL(uri);

    if (versionedUriGroupsPattern.test(uri)) {
      return {
        type: "Ok",
        inner: uri as VersionedUri,
      };
    }
  } catch {
    /* return error below */
  }
  return {
    type: "Err",
    inner: {
      reason: "InvalidBaseUri",
      inner: { reason: "UrlParseError", inner: "" },
    },
  };
};