import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, List, Text, useTheme } from "react-native-paper";
import type { CheckResult } from "../types";

interface DeepCheckPanelProps {
  check?: CheckResult;
  labels: {
    deepChecks: string;
    dns: string;
    tls: string;
    keyword: string;
    certExpires: string;
    daysLeft: string;
    notResolved: string;
    invalidCert: string;
    keywordMissing: string;
    keywordFound: string;
  };
}

export const DeepCheckPanel: React.FC<DeepCheckPanelProps> = ({
  check,
  labels,
}) => {
  const theme = useTheme();

  if (!check?.dns && !check?.tls && !check?.keyword) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {labels.deepChecks}
      </Text>

      {check.dns && (
        <>
          <List.Item
            title={labels.dns}
            description={
              check.dns.resolved
                ? check.dns.addresses.join(", ")
                : check.dns.error ?? labels.notResolved
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon={check.dns?.resolved ? "dns" : "alert-circle-outline"}
                color={check.dns?.resolved ? theme.colors.primary : theme.colors.error}
              />
            )}
            right={() =>
              check.dns?.latencyMs != null ? (
                <Text variant="labelMedium" style={{ alignSelf: "center" }}>
                  {check.dns.latencyMs}ms
                </Text>
              ) : null
            }
          />
          <Divider />
        </>
      )}

      {check.tls && (
        <>
          <List.Item
            title={labels.tls}
            description={
              check.tls.valid
                ? `${check.tls.issuer ?? "Certificate"} · ${
                    check.tls.daysUntilExpiry != null
                      ? `${labels.daysLeft}: ${check.tls.daysUntilExpiry}`
                      : labels.certExpires
                  }`
                : check.tls.error ?? labels.invalidCert
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon={check.tls?.valid ? "lock-check" : "lock-alert"}
                color={check.tls?.valid ? theme.colors.primary : theme.colors.error}
              />
            )}
          />
          <Divider />
        </>
      )}

      {check.keyword && (
        <List.Item
          title={labels.keyword}
          description={
            check.keyword.matched
              ? `${labels.keywordFound}: "${check.keyword.keyword}"`
              : check.keyword.error ?? labels.keywordMissing
          }
          left={(props) => (
            <List.Icon
              {...props}
              icon={check.keyword?.matched ? "text-search" : "text-box-remove-outline"}
              color={check.keyword?.matched ? theme.colors.primary : theme.colors.error}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  title: {
    fontWeight: "600",
    marginBottom: 8,
  },
});
