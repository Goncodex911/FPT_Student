import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ExamScreen from '../screens/ExamScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/* ── Tab icon with active indicator dot ── */
const TabIcon = ({ name, focused, color }) => (
  <View style={ti.wrap}>
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={24}
      color={focused ? COLORS.primary : COLORS.textSub}
    />
  </View>
);
const ti = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

const HomeStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Schedule" component={ScheduleScreen} />
    <HomeStack.Screen name="Exam" component={ExamScreen} />
  </HomeStack.Navigator>
);

/* ── Bottom Tab Navigator ── */
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.navy,
        borderTopWidth: 0,
        borderTopColor: COLORS.border,
        height: Platform.OS === 'ios' ? 75 : 62,
        paddingBottom: Platform.OS === 'ios' ? 26 : 8,
        paddingTop: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#8899BB',
      tabBarShowLabel: false,  // hide labels, icons only (like myFAP)
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={{
        tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
      }}
    />
    <Tab.Screen
      name="Chat"
      component={HomeScreen}   // placeholder
      options={{
        tabBarIcon: ({ focused, color }) => <TabIcon name="chatbubble-ellipses" focused={focused} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} />,
      }}
    />
  </Tab.Navigator>
);

/* ── Root Stack ── */
const AppNavigator = () => {
  const { currentStudent } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!currentStudent ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
