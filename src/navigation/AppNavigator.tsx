import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import DronesScreen from '../screens/DronesScreen';
import FlightScreen from '../screens/FlightScreen';
import ResultScreen from '../screens/ResultScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatsScreen from '../screens/StatsScreen';
import RebZonesScreen from '../screens/RebZonesScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TasksScreen from '../screens/TasksScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import PilotsOverviewScreen from '../screens/PilotsOverviewScreen';
import PatternsScreen from '../screens/PatternsScreen';
import MastersScreen from '../screens/MastersScreen';
import PilotsScreen from '../screens/PilotsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import AuditHistoryScreen from '../screens/AuditHistoryScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="Drones" component={DronesScreen} />
            <Stack.Screen name="Flight" component={FlightScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="RebZones" component={RebZonesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="PilotsOverview" component={PilotsOverviewScreen} />
            <Stack.Screen name="Patterns" component={PatternsScreen} />
            <Stack.Screen name="Masters" component={MastersScreen} />
            <Stack.Screen name="Pilots" component={PilotsScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="AuditHistory" component={AuditHistoryScreen} />
            <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}