import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    primaryContainer: '#EADDFF',
    secondary: '#625B71',
    secondaryContainer: '#E8DEF8',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    background: '#FFFBFE',
    error: '#B3261E',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1C1B1F',
    onBackground: '#1C1B1F',
    outline: '#79747E',
    success: '#2E7D32',
    warning: '#ED6C02',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    primaryContainer: '#4F378B',
    secondary: '#CCC2DC',
    secondaryContainer: '#4A4458',
    surface: '#1C1B1F',
    surfaceVariant: '#49454F',
    background: '#1C1B1F',
    error: '#F2B8B5',
    onPrimary: '#381E72',
    onSecondary: '#332D41',
    onSurface: '#E6E1E5',
    onBackground: '#E6E1E5',
    outline: '#938F99',
    success: '#66BB6A',
    warning: '#FFA726',
  },
};
