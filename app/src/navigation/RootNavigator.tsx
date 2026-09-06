import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../theme';
import * as api from '../services/api';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import LockScreen from '../screens/LockScreen';
import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import MessagesScreen from '../screens/MessagesScreen';
import DuaScreen from '../screens/DuaScreen';
import MoreScreen from '../screens/MoreScreen';
import PrayerScreen from '../screens/PrayerScreen';
import TreatmentScreen from '../screens/TreatmentScreen';
import VisitorsScreen from '../screens/VisitorsScreen';
import VictoriesScreen from '../screens/VictoriesScreen';
import PeopleScreen from '../screens/PeopleScreen';
import PhotosScreen from '../screens/PhotosScreen';
import VoiceScreen from '../screens/VoiceScreen';
import ContactsScreen from '../screens/ContactsScreen';
import JourneyScreen from '../screens/JourneyScreen';
import BookScreen from '../screens/BookScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paper,
    card: colors.paper,
    text: colors.ink,
    primary: colors.sage600,
    border: colors.line,
  },
};

const TAB_ICONS: Record<string, string> = { Home: '🌱', Journal: '✍️', Messages: '💌', Dua: '🤲', More: '⋯' };
const TAB_LABELS: Record<string, string> = { Home: 'আজ', Journal: 'জার্নাল', Messages: 'বার্তা', Dua: 'দোয়া', More: 'আরও' };

/** Screens below the tabs keep a small, quiet header. */
function DetailHeader({ title }: { title: string }) {
  const navigation = useNavigation<any>();
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 56,
        paddingHorizontal: 14, paddingBottom: 10, backgroundColor: colors.paper,
        borderBottomWidth: 1, borderBottomColor: colors.line,
      }}
    >
      <Text onPress={() => navigation.goBack()} style={{ fontSize: 15, color: colors.sage700 }}>←</Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.ink }}>{title}</Text>
    </View>
  );
}

/**
 * Navigation.
 *
 * Note what the bottom tabs are — and are not:
 *      আজ · জার্নাল · বার্তা · দোয়া · আরও
 *
 * There is no "Treatment" tab. Treatment lives inside "আরও": reachable, but
 * never the front door. That single decision carries the whole UX principle —
 * don't make Sabiha feel like a patient.
 */
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, height: 64, paddingTop: 6 },
        tabBarLabel: ({ focused }) => (
          <Text style={{ fontSize: 11, color: focused ? colors.sage800 : colors.faint, fontWeight: focused ? '600' : '400' }}>
            {TAB_LABELS[route.name]}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: focused ? 20 : 18 }}>{TAB_ICONS[route.name]}</Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Dua" component={DuaScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const u = await api.currentUser();
      setUser(u);
      if (u) {
        const pin = await AsyncStorage.getItem('sabiha.pin');
        setLocked(!!pin);
        setStarted(true);
      }
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Text style={{ fontSize: 40 }}>🌱</Text>
        <ActivityIndicator color={colors.sage500} />
      </View>
    );
  }

  const signedIn = !!user && started;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        {!signedIn ? (
          <>
            <Stack.Screen name="Welcome">
              {() => (
                <WelcomeScreen
                  onBegin={() => setStarted(true)}
                  onLogin={() => setStarted(true)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">{() => <LoginScreen onDone={refresh} />}</Stack.Screen>
          </>
        ) : locked ? (
          <Stack.Screen name="Lock">{() => <LockScreen onUnlock={() => setLocked(false)} />}</Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Prayer">
              {() => <><DetailHeader title="🕌 নামাজ" /><PrayerScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Treatment">
              {() => <><DetailHeader title="🏥 আমার চিকিৎসা" /><TreatmentScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Visitors">
              {() => <><DetailHeader title="🫂 আজ কে এসেছিল?" /><VisitorsScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Victories">
              {() => <><DetailHeader title="🌱 ছোট্ট জয়" /><VictoriesScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="People">
              {() => <><DetailHeader title="💫 মানুষ ও স্মৃতি" /><PeopleScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Photos">
              {() => <><DetailHeader title="📷 আমার ছবি" /><PhotosScreen userId={user?.id} /></>}
            </Stack.Screen>
            <Stack.Screen name="Voice">
              {() => <><DetailHeader title="🎙️ ভয়েস ডায়েরি" /><VoiceScreen userId={user?.id} /></>}
            </Stack.Screen>
            <Stack.Screen name="Contacts">
              {() => <><DetailHeader title="☎️ জরুরি যোগাযোগ" /><ContactsScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Journey">
              {() => <><DetailHeader title="🌸 আমার journey" /><JourneyScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Book">
              {() => <><DetailHeader title="📖 Journey Book" /><BookScreen /></>}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {() => (
                <>
                  <DetailHeader title="⚙️ Settings" />
                  <SettingsScreen user={user} onSignOut={async () => { await api.signOut(); setStarted(false); refresh(); }} />
                </>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
