import { EssentialsConnector } from "@elastosfoundation/essentials-connector-client-browser";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class EssentialsService {
  /**
   * Kill the wallet connect session
   */
  public disconnect(): Promise<void> {
    try {
      return Promise.resolve()
    } catch (e) {
      console.error("Error while trying to disconnect wallet session", e);
      throw new Error("Failed to disconnect")
    }
  }
}
