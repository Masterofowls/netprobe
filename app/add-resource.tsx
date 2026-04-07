import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';

const ICON_OPTIONS = [
  'web',
  'server',
  'cloud',
  'database',
  'api',
  'shield',
  'lock',
  'earth',
  'wifi',
  'cellphone',
];

const COLOR_OPTIONS = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#009688',
  '#4CAF50',
  '#FF9800',
];

export default function AddResourceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addResource } = useAppStore();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('https://');
  const [category, setCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('web');
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        newErrors.url = 'URL must use HTTP or HTTPS protocol';
      }
    } catch {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await addResource({
      name: name.trim(),
      url: url.trim(),
      icon: selectedIcon,
      color: selectedColor,
      category: category.trim() || undefined,
    });

    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        New Custom Resource
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Add a custom web service to monitor its connectivity
      </Text>

      <TextInput
        label="Resource Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        error={!!errors.name}
        placeholder="e.g., My API Server"
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <TextInput
        label="URL"
        value={url}
        onChangeText={setUrl}
        mode="outlined"
        style={styles.input}
        error={!!errors.url}
        keyboardType="url"
        autoCapitalize="none"
        placeholder="https://example.com"
      />
      <HelperText type="error" visible={!!errors.url}>
        {errors.url}
      </HelperText>

      <TextInput
        label="Category (optional)"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        style={styles.input}
        placeholder="e.g., API, Hosting, CDN"
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Icon
      </Text>
      <View style={styles.optionsRow}>
        {ICON_OPTIONS.map((icon) => (
          <Button
            key={icon}
            mode={selectedIcon === icon ? 'contained' : 'outlined'}
            onPress={() => setSelectedIcon(icon)}
            compact
            style={styles.optionButton}
            icon={icon}
          >
            {''}
          </Button>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Color
      </Text>
      <View style={styles.optionsRow}>
        {COLOR_OPTIONS.map((color) => (
          <Button
            key={color}
            mode={selectedColor === color ? 'contained' : 'outlined'}
            onPress={() => setSelectedColor(color)}
            compact
            style={[
              styles.colorButton,
              {
                backgroundColor:
                  selectedColor === color ? color : 'transparent',
                borderColor: color,
              },
            ]}
          >
            {''}
          </Button>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          icon="check"
        >
          Save Resource
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    minWidth: 48,
  },
  colorButton: {
    minWidth: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
});
