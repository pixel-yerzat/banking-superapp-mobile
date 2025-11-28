**Проект**: Banking Superapp

- **Описание**: Мобильное приложение на React Native (bare / EAS-aware) для банковских функций: аккаунты, карты, переводы, депозиты, кредиты, чат и уведомления.

**Технологии**:

- **Фреймворк**: React Native
- **Язык**: JavaScript
- **Менеджер пакетов**: npm (в проекте используются скрипты npm)
- **Сборка Android**: Gradle (папка `android/`)
- **(Опционально) EAS / Expo**: в репозитории присутствуют `app.json` и `eas.json`, поэтому можно использовать EAS для сборок

**Требования (Prerequisites)**:

- Node.js (рекомендуется LTS версия, например 18+)
- npm (или yarn — если предпочитаете)
- Java JDK (для Android сборки)
- Android SDK и Android Studio (или настроенный эмулятор/устройство)
- На macOS: Xcode и CocoaPods для iOS-сборки

**Установка зависимостей**:

```bash
# в корне проекта
npm install
```

Если используете macOS и хотите собирать iOS:

```bash
cd ios && pod install && cd ..
```

**Команды разработки**:

- Запустить Metro (с очисткой кеша):

```bash
npm start -- --reset-cache
```

- Запустить приложение на Android (подключённый девайс или эмулятор):

```bash
npx react-native run-android
```

- На iOS (macOS):

```bash
npx react-native run-ios
```

> В проекте уже использовалась команда `npm start -c` — можно применять её при необходимости.

**Сборка релиза**:

- Android (через Gradle):

```bash
cd android
./gradlew assembleRelease
# или на Windows (bash shell) используйте gradlew
./gradlew assembleRelease
cd ..
```

- iOS (на macOS через Xcode или командную строку):

```bash
cd ios
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release
```

Если вы используете EAS (Expo Application Services):

```bash
# установка EAS CLI, если ещё не установлен
npm install -g eas-cli

# сборка Android через EAS
eas build --platform android

# сборка iOS через EAS (требуется Mac / Apple account настроен в EAS)
eas build --platform ios
```

**Переменные окружения / конфигурация**:

- В репозитории явных `.env` файлов нет — добавьте свой `.env` в корне с нужными ключами (например `API_BASE_URL`, `SENTRY_DSN` и т.д.).
- Убедитесь, что `.gitignore` исключает секреты и `.env` (при необходимости).

**Структура проекта (ключевые директории)**:

- `android/` — Android-проекты и Gradle конфигурация
- `assets/` — статические ресурсы
- `src/` — исходный код приложения
  - `src/api/` — модули API и вызовов к бэкенду
  - `src/components/` — переиспользуемые UI-компоненты
  - `src/screens/` — экраны приложения
  - `src/navigation/` — навигация
  - `src/services/` — сервисные модули (авторизация, сокеты и т.д.)
  - `src/store/` — Redux store / слайсы
  - `src/theme/` — цвета и темы
  - `src/utils/` — утилиты и форматтеры

**Полезные скрипты (примерные)**:

- `npm start` — запустить Metro
- `npx react-native run-android` — сборка и запуск на Android
- `npx react-native run-ios` — запуск на iOS (macOS)
- `eas build` — EAS сборки (если настроено)

**Troubleshooting / Частые проблемы**:

- Metro bundle не запускается / кеш: очистите кеш:

```bash
npx react-native start --reset-cache
```

**Советы по разработке**:

- Используйте Android Studio для управления эмуляторами и просмотра логов `adb logcat`.
- На Windows для gradle-команд используйте `gradlew` в папке `android/`.
- Регулярно обновляйте зависимости и тестируйте на устройстве.

**Где смотреть код**:

- Главная точка входа: `index.js` и `App.js` в корне и в `src/App.js` (если есть).
- Навигация: `src/navigation/` и `src/navigation/RootNavigator.js`.
