import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import type { RootTabParamList, HomeStackParamList, LibraryStackParamList, ExploreStackParamList, ProfileStackParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import AddGameScreen from '../screens/AddGameScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import WikiScreen from '../screens/WikiScreen';
import WikiPageScreen from '../screens/WikiPageScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LinkSteamScreen from '../screens/LinkSteamScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function LibraryStackScreen() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="Library" component={LibraryScreen} />
      <LibraryStack.Screen name="AddGame" component={AddGameScreen} />
      <LibraryStack.Screen name="GameDetail" component={GameDetailScreen} />
      <LibraryStack.Screen name="Achievements" component={AchievementsScreen} />
      <LibraryStack.Screen name="Wiki" component={WikiScreen} />
      <LibraryStack.Screen name="WikiPage" component={WikiPageScreen} />
    </LibraryStack.Navigator>
  );
}

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="Explore" component={ExploreScreen} />
    </ExploreStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="LinkSteam" component={LinkSteamScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof RootTabParamList, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { focused: 'home', default: 'home-outline' },
  LibraryTab: { focused: 'game-controller', default: 'game-controller-outline' },
  ExploreTab: { focused: 'compass', default: 'compass-outline' },
  ProfileTab: { focused: 'person', default: 'person-outline' },
};

export default function AppNavigator() {
  const { theme } = useTheme();

  const navTheme = theme.mode === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.colors.bg, card: theme.colors.surface, border: theme.colors.border, primary: theme.colors.primary, text: theme.colors.text } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.colors.bg, card: theme.colors.surface, border: theme.colors.border, primary: theme.colors.primary, text: theme.colors.text } };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.default;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="LibraryTab" component={LibraryStackScreen} options={{ title: 'Library' }} />
        <Tab.Screen name="ExploreTab" component={ExploreStackScreen} options={{ title: 'Explore' }} />
        <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
