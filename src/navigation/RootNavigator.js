import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading } from '../store/slices/authSlice';
import { selectUnreadNotifications } from '../store/slices/uiSlice';
import { useAuth, useSocket } from '../hooks';
import { colors, typography } from '../theme/colors';

// Auth Screens
import {
  SplashScreen,
  LoginScreen,
  RegisterScreen,
  OTPVerificationScreen,
} from '../screens/auth';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import { AccountsListScreen, AccountDetailScreen } from '../screens/accounts';
import { CardsListScreen } from '../screens/cards';
import { TransfersScreen } from '../screens/transfers';
import { MoreScreen } from '../screens/more';
import { LoansScreen, LoanCalculatorScreen } from '../screens/loans';
import { DepositsScreen } from '../screens/deposits';
import { NotificationsScreen } from '../screens/notifications';
import { SettingsScreen, SecurityScreen } from '../screens/settings';
import { ChatScreen } from '../screens/chat';
import { AnalyticsScreen } from '../screens/analytics';
import { ProfileScreen } from '../screens/profile';
import { QRScannerScreen } from '../screens/qr';
import { TransactionDetailScreen } from '../screens/transactions';
import { NewTransferScreen } from '../screens/transfers';
import { FAQScreen } from '../screens/faq';
import { TemplatesScreen, CreateTemplateScreen } from '../screens/templates';
import { ProvidersScreen } from '../screens/providers';
import { CreateCardScreen } from '../screens/cards';
import { CreateAccountScreen } from '../screens/accounts';
import { LoanApplicationScreen } from '../screens/loans';
import { OpenDepositScreen } from '../screens/deposits';

// Placeholder screens
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ ...typography.h3, color: colors.textPrimary }}>{route.name}</Text>
    <Text style={{ ...typography.body2, color: colors.textSecondary, marginTop: 8 }}>Coming Soon</Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    <Stack.Screen name="ForgotPassword" component={PlaceholderScreen} />
  </Stack.Navigator>
);

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="QRScanner" component={QRScannerScreen} />
    <Stack.Screen name="NewTransfer" component={NewTransferScreen} />
  </Stack.Navigator>
);

// Accounts Stack
const AccountsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AccountsList" component={AccountsListScreen} />
    <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
  </Stack.Navigator>
);

// Cards Stack
const CardsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CardsList" component={CardsListScreen} />
    <Stack.Screen name="CardDetail" component={PlaceholderScreen} />
    <Stack.Screen name="CreateCard" component={CreateCardScreen} />
  </Stack.Navigator>
);

// Transfers Stack
const TransfersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TransfersList" component={TransfersScreen} />
    <Stack.Screen name="NewTransfer" component={NewTransferScreen} />
    <Stack.Screen name="Templates" component={TemplatesScreen} />
    <Stack.Screen name="CreateTemplate" component={CreateTemplateScreen} />
    <Stack.Screen name="Providers" component={ProvidersScreen} />
  </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreMain" component={MoreScreen} />
    <Stack.Screen name="Loans" component={LoansScreen} />
    <Stack.Screen name="LoanDetail" component={PlaceholderScreen} />
    <Stack.Screen name="LoanCalculator" component={LoanCalculatorScreen} />
    <Stack.Screen name="LoanApplication" component={LoanApplicationScreen} />
    <Stack.Screen name="Deposits" component={DepositsScreen} />
    <Stack.Screen name="DepositDetail" component={PlaceholderScreen} />
    <Stack.Screen name="DepositCalculator" component={PlaceholderScreen} />
    <Stack.Screen name="OpenDeposit" component={OpenDepositScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="NotificationSettings" component={PlaceholderScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="FAQ" component={FAQScreen} />
    <Stack.Screen name="Support" component={PlaceholderScreen} />
    <Stack.Screen name="About" component={PlaceholderScreen} />
    <Stack.Screen name="Templates" component={TemplatesScreen} />
    <Stack.Screen name="CreateTemplate" component={CreateTemplateScreen} />
    <Stack.Screen name="AutoPayments" component={PlaceholderScreen} />
    <Stack.Screen name="Providers" component={ProvidersScreen} />
  </Stack.Navigator>
);

// Tab Navigator
const AppTabs = () => {
  const unreadNotifications = useSelector(selectUnreadNotifications);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Accounts':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Cards':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Transfers':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray100,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Главная' }}
      />
      <Tab.Screen 
        name="Accounts" 
        component={AccountsStack}
        options={{ tabBarLabel: 'Счета' }}
      />
      <Tab.Screen 
        name="Cards" 
        component={CardsStack}
        options={{ tabBarLabel: 'Карты' }}
      />
      <Tab.Screen 
        name="Transfers" 
        component={TransfersStack}
        options={{ tabBarLabel: 'Переводы' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ tabBarLabel: 'Ещё' }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const { initialize } = useAuth();
  
  // Initialize socket connection when authenticated
  useSocket();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
