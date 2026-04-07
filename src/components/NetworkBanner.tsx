import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";
import type { NetworkState } from "../types";

interface Props {
  networkState: NetworkState;
}

export const NetworkBanner: React.FC<Props> = ({ networkState }) => {
  const theme = useTheme();

  if (networkState.isConnected === null) return null;
  if (networkState.isConnected && networkState.isInternetReachable !== false) {
    return null;
  }

  const isNoInternet =
    networkState.isConnected && networkState.isInternetReachable === false;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isNoInternet
            ? (theme.colors.warning ?? "#ED6C02")
            : theme.colors.error,
        },
      ]}
    >
      <Icon
        source={isNoInternet ? "wifi-alert" : "wifi-off"}
        size={18}
        color="#fff"
      />
      <Text style={styles.text}>
        {isNoInternet
          ? "Connected but no internet access"
          : `No network connection (${networkState.type ?? "unknown"})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
