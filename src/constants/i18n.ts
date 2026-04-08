export type Locale = "en" | "ru";

export interface Translations {
  // App
  appName: string;
  appTagline: string;

  // Header
  lastCheck: string;
  never: string;
  offline: string;

  // Search
  searchResources: string;
  noMatch: string;
  noResources: string;

  // Status
  online: string;
  issues: string;
  pending: string;
  total: string;
  statusOnline: string;
  statusOffline: string;
  statusTimeout: string;
  statusDnsFailure: string;
  statusBlocked: string;
  statusError: string;
  statusChecking: string;
  statusUnknown: string;

  // Sort
  sortDefault: string;
  sortStatus: string;
  sortName: string;

  // Quick add
  addResource: string;
  quickAdd: string;
  quickAddHint: string;
  pasteUrl: string;
  addWebsite: string;
  fetchingInfo: string;

  // Add resource form
  newCustomResource: string;
  addCustomSubtitle: string;
  resourceName: string;
  resourceNamePlaceholder: string;
  url: string;
  urlPlaceholder: string;
  categoryOptional: string;
  categoryPlaceholder: string;
  icon: string;
  color: string;
  cancel: string;
  save: string;
  nameRequired: string;
  invalidUrl: string;
  invalidProtocol: string;

  // Settings
  settings: string;
  autoRefresh: string;
  autoRefreshDesc: string;
  refreshInterval: string;
  sec15: string;
  sec30: string;
  min1: string;
  min5: string;
  requestTimeout: string;
  sec5: string;
  sec10: string;
  theme: string;
  systemDefault: string;
  light: string;
  dark: string;
  resourceCatalog: string;
  hideBuiltIn: string;
  hideBuiltInDesc: string;
  browseCatalog: string;
  servicesEnabled: string;
  systemIntegration: string;
  notifications: string;
  notificationsDesc: string;
  backgroundMonitoring: string;
  backgroundMonitoringDesc: string;
  hapticFeedback: string;
  hapticFeedbackDesc: string;
  statistics: string;
  catalogResources: string;
  fromCatalog: string;
  customResources: string;
  manuallyAdded: string;
  totalActive: string;
  availableInCatalog: string;
  resetToDefaults: string;
  resetDesc: string;
  language: string;
  languageDesc: string;
  english: string;
  russian: string;

  // Resource detail
  resourceDetails: string;
  latency: string;
  httpStatus: string;
  lastChecked: string;
  errorMessage: string;
  responseHistory: string;
  recheck: string;
  deleteResource: string;

  // Catalog
  catalog: string;
  searchCatalog: string;
  selected: string;

  // Pins
  pin: string;
  unpin: string;
  pinned: string;

  // Extra
  currentStatus: string;
  checkHistory: string;
  noHistory: string;
  builtIn: string;
  custom: string;
  goBack: string;
  resourceNotFound: string;
  deselectAll: string;
  selectAll: string;
  openInBrowser: string;
  ipAddress: string;
  country: string;
}

const en: Translations = {
  appName: "NetProbe",
  appTagline: "Real-time Network Connectivity Tester",

  lastCheck: "Last",
  never: "Never",
  offline: "Offline",

  searchResources: "Search resources...",
  noMatch: "No resources match your search",
  noResources: "No resources configured",

  online: "Online",
  issues: "Issues",
  pending: "Pending",
  total: "Total",
  statusOnline: "Online",
  statusOffline: "Offline",
  statusTimeout: "Timeout",
  statusDnsFailure: "DNS Fail",
  statusBlocked: "Blocked",
  statusError: "Error",
  statusChecking: "Checking",
  statusUnknown: "Unknown",

  sortDefault: "Default",
  sortStatus: "By Status",
  sortName: "By Name",

  quickAdd: "Quick Add",
  quickAddHint: "Paste a URL to add",
  pasteUrl: "https://example.com",
  addWebsite: "Add",
  fetchingInfo: "Fetching info...",

  addResource: "Add Resource",
  newCustomResource: "New Custom Resource",
  addCustomSubtitle: "Add a custom web service to monitor its connectivity",
  resourceName: "Resource Name",
  resourceNamePlaceholder: "e.g., My API Server",
  url: "URL",
  urlPlaceholder: "https://example.com",
  categoryOptional: "Category (optional)",
  categoryPlaceholder: "e.g., API, Hosting, CDN",
  icon: "Icon",
  color: "Color",
  cancel: "Cancel",
  save: "Save Resource",
  nameRequired: "Name is required",
  invalidUrl: "Please enter a valid URL",
  invalidProtocol: "URL must use HTTP or HTTPS protocol",

  settings: "Settings",
  autoRefresh: "Auto Refresh",
  autoRefreshDesc: "Periodically check all resources",
  refreshInterval: "Refresh Interval",
  sec15: "15 seconds",
  sec30: "30 seconds",
  min1: "1 minute",
  min5: "5 minutes",
  requestTimeout: "Request Timeout",
  sec5: "5 seconds",
  sec10: "10 seconds",
  theme: "Theme",
  systemDefault: "System Default",
  light: "Light",
  dark: "Dark",
  resourceCatalog: "Resource Catalog",
  hideBuiltIn: "Hide Built-in Resources",
  hideBuiltInDesc: "Only show custom resources on dashboard",
  browseCatalog: "Browse Catalog",
  servicesEnabled: "services enabled",
  systemIntegration: "System Integration",
  notifications: "Notifications",
  notificationsDesc: "Alert when services go offline or recover",
  backgroundMonitoring: "Background Monitoring",
  backgroundMonitoringDesc: "Check services periodically when app is closed",
  hapticFeedback: "Haptic Feedback",
  hapticFeedbackDesc: "Vibrate on status changes",
  statistics: "Statistics",
  catalogResources: "Catalog Resources",
  fromCatalog: "From the built-in catalog",
  customResources: "Custom Resources",
  manuallyAdded: "Manually added",
  totalActive: "Total Active",
  availableInCatalog: "Available in Catalog",
  resetToDefaults: "Reset to Defaults",
  resetDesc:
    "This will remove all custom resources and restore default settings",
  language: "Language",
  languageDesc: "Interface language",
  english: "English",
  russian: "Русский",

  resourceDetails: "Resource Details",
  latency: "Latency",
  httpStatus: "HTTP Status",
  lastChecked: "Last Checked",
  errorMessage: "Error",
  responseHistory: "Response History",
  recheck: "Recheck Now",
  deleteResource: "Delete Resource",

  catalog: "Resource Catalog",
  searchCatalog: "Search catalog...",
  selected: "selected",

  pin: "Pin to top",
  unpin: "Unpin",
  pinned: "Pinned",

  currentStatus: "Current Status",
  checkHistory: "Check History",
  noHistory: "No history yet",
  builtIn: "Built-in",
  custom: "Custom",
  goBack: "Go Back",
  resourceNotFound: "Resource not found",
  deselectAll: "Deselect",
  selectAll: "Select all",
  openInBrowser: "Open in Browser",
  ipAddress: "IP Address",
  country: "Country",
};

const ru: Translations = {
  appName: "NetProbe",
  appTagline: "Мониторинг сетевого подключения",

  lastCheck: "Обновл.",
  never: "Никогда",
  offline: "Нет сети",

  searchResources: "Поиск ресурсов...",
  noMatch: "Ничего не найдено",
  noResources: "Нет настроенных ресурсов",

  online: "Доступно",
  issues: "Ошибки",
  pending: "Ожидание",
  total: "Всего",
  statusOnline: "Доступен",
  statusOffline: "Недоступен",
  statusTimeout: "Таймаут",
  statusDnsFailure: "Ошибка DNS",
  statusBlocked: "Заблокирован",
  statusError: "Ошибка",
  statusChecking: "Проверка",
  statusUnknown: "Неизвестно",

  sortDefault: "По умолчанию",
  sortStatus: "По статусу",
  sortName: "По имени",

  quickAdd: "Быстрое добавление",
  quickAddHint: "Вставьте URL для добавления",
  pasteUrl: "https://example.com",
  addWebsite: "Добавить",
  fetchingInfo: "Получение данных...",

  addResource: "Добавить",
  newCustomResource: "Новый ресурс",
  addCustomSubtitle: "Добавьте веб-сервис для мониторинга",
  resourceName: "Название",
  resourceNamePlaceholder: "напр., Мой API сервер",
  url: "URL",
  urlPlaceholder: "https://example.com",
  categoryOptional: "Категория (необязательно)",
  categoryPlaceholder: "напр., API, Хостинг, CDN",
  icon: "Иконка",
  color: "Цвет",
  cancel: "Отмена",
  save: "Сохранить",
  nameRequired: "Укажите название",
  invalidUrl: "Введите корректный URL",
  invalidProtocol: "URL должен использовать HTTP или HTTPS",

  settings: "Настройки",
  autoRefresh: "Автообновление",
  autoRefreshDesc: "Периодическая проверка всех ресурсов",
  refreshInterval: "Интервал обновления",
  sec15: "15 секунд",
  sec30: "30 секунд",
  min1: "1 минута",
  min5: "5 минут",
  requestTimeout: "Таймаут запроса",
  sec5: "5 секунд",
  sec10: "10 секунд",
  theme: "Тема",
  systemDefault: "Системная",
  light: "Светлая",
  dark: "Тёмная",
  resourceCatalog: "Каталог ресурсов",
  hideBuiltIn: "Скрыть встроенные",
  hideBuiltInDesc: "Показывать только свои ресурсы",
  browseCatalog: "Открыть каталог",
  servicesEnabled: "сервисов включено",
  systemIntegration: "Системная интеграция",
  notifications: "Уведомления",
  notificationsDesc: "Оповещение при сбоях и восстановлении",
  backgroundMonitoring: "Фоновый мониторинг",
  backgroundMonitoringDesc: "Проверка при закрытом приложении",
  hapticFeedback: "Вибрация",
  hapticFeedbackDesc: "Тактильная обратная связь",
  statistics: "Статистика",
  catalogResources: "Из каталога",
  fromCatalog: "Встроенные ресурсы",
  customResources: "Свои ресурсы",
  manuallyAdded: "Добавленные вручную",
  totalActive: "Всего активных",
  availableInCatalog: "Доступно в каталоге",
  resetToDefaults: "Сбросить настройки",
  resetDesc: "Удалить все свои ресурсы и вернуть настройки по умолчанию",
  language: "Язык",
  languageDesc: "Язык интерфейса",
  english: "English",
  russian: "Русский",

  resourceDetails: "Детали ресурса",
  latency: "Задержка",
  httpStatus: "HTTP статус",
  lastChecked: "Последняя проверка",
  errorMessage: "Ошибка",
  responseHistory: "История ответов",
  recheck: "Проверить",
  deleteResource: "Удалить ресурс",

  catalog: "Каталог ресурсов",
  searchCatalog: "Поиск в каталоге...",
  selected: "выбрано",

  pin: "Закрепить",
  unpin: "Открепить",
  pinned: "Закреплено",

  currentStatus: "Текущий статус",
  checkHistory: "История проверок",
  noHistory: "Пока нет данных",
  builtIn: "Встроенный",
  custom: "Пользовательский",
  goBack: "Назад",
  resourceNotFound: "Ресурс не найден",
  deselectAll: "Снять выбор",
  selectAll: "Выбрать все",
  openInBrowser: "Открыть в браузере",
  ipAddress: "IP адрес",
  country: "Страна",
};

const translations: Record<Locale, Translations> = { en, ru };

export const getTranslations = (locale: Locale): Translations =>
  translations[locale];
