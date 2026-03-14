import streamDeck, {
  action,
  KeyDownEvent,
  KeyAction,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
  DidReceiveSettingsEvent,
} from "@elgato/streamdeck";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type VpnSettings = {
  connectionName: string;
};

@action({ UUID: "com.jochenissing.vpn-toggle.toggle" })
export class VpnToggleAction extends SingletonAction<VpnSettings> {
  private pollIntervals = new Map<string, ReturnType<typeof setInterval>>();

  override async onWillAppear(ev: WillAppearEvent<VpnSettings>): Promise<void> {
    const { connectionName } = ev.payload.settings;
    const key = ev.action as KeyAction<VpnSettings>;
    if (connectionName) {
      await this.updateKeyState(key, connectionName);
      this.startPolling(ev.action.id, key, connectionName);
    }
  }

  override async onWillDisappear(ev: WillDisappearEvent<VpnSettings>): Promise<void> {
    this.stopPolling(ev.action.id);
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<VpnSettings>): Promise<void> {
    const { connectionName } = ev.payload.settings;
    const key = ev.action as KeyAction<VpnSettings>;
    this.stopPolling(ev.action.id);
    if (connectionName) {
      await this.updateKeyState(key, connectionName);
      this.startPolling(ev.action.id, key, connectionName);
    }
  }

  override async onKeyDown(ev: KeyDownEvent<VpnSettings>): Promise<void> {
    const { connectionName } = ev.payload.settings;
    if (!connectionName) {
      await ev.action.showAlert();
      return;
    }

    try {
      const connected = await this.isConnected(connectionName);
      const command = connected ? "stop" : "start";
      await execAsync(`scutil --nc ${command} "${connectionName}"`);

      // Wait briefly for the state change to take effect
      await new Promise((r) => setTimeout(r, 1500));
      await this.updateKeyState(ev.action, connectionName);
    } catch (err) {
      streamDeck.logger.error(`Failed to toggle VPN: ${err}`);
      await ev.action.showAlert();
    }
  }

  private async isConnected(connectionName: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`scutil --nc status "${connectionName}"`);
      const firstLine = stdout.trim().split("\n")[0];
      return firstLine === "Connected";
    } catch {
      return false;
    }
  }

  private async updateKeyState(
    key: KeyAction<VpnSettings>,
    connectionName: string
  ): Promise<void> {
    const connected = await this.isConnected(connectionName);
    await key.setState(connected ? 1 : 0);
  }

  private startPolling(
    actionId: string,
    key: KeyAction<VpnSettings>,
    connectionName: string
  ): void {
    this.stopPolling(actionId);
    const interval = setInterval(async () => {
      try {
        await this.updateKeyState(key, connectionName);
      } catch {
        // Ignore polling errors
      }
    }, 5000);
    this.pollIntervals.set(actionId, interval);
  }

  private stopPolling(actionId: string): void {
    const interval = this.pollIntervals.get(actionId);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(actionId);
    }
  }
}
