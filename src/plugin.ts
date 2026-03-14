import streamDeck from "@elgato/streamdeck";
import { VpnToggleAction } from "./actions/vpn-toggle";

streamDeck.actions.registerAction(new VpnToggleAction());
streamDeck.connect();
