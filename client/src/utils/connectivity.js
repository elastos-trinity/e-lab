import { connectivity } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-client-browser";

export const essentialsConnector = new EssentialsConnector();

let connectivityInitialized = false;

export function prepareConnectivitySDK() {
  if (connectivityInitialized)
    return;

  console.log("Preparing the Elastos connectivity SDK");

  connectivity.registerConnector(essentialsConnector);
  connectivityInitialized = true;
}