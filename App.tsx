import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, Text, View, Alert } from 'react-native';

import LoginPage from './screens/LoginPage';
import SignupPage from './screens/SignupPage';
import ComplaintListPage from './screens/ComplaintListPage';
import NewComplaintPage from './screens/NewComplaintPage';
import ComplaintDetailsPage from './screens/ComplaintDetailPage';
import HostelApplicationPage from './screens/RoomApplicationPage';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function LogoutButton({ navigation }: any) {
    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
    };

    return (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 12 }}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
    );
}

const EmptyChild = () => {
    return <View></View>
}

function DrawerRoutes() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen
                name="Hostels"
                component={HostelApplicationPage}
            />
            <Drawer.Screen
                name="Complaints"
                component={ComplaintListPage}
            />
            <Drawer.Screen
                name="Submit Complaint"
                component={NewComplaintPage}
            />
            <Drawer.Screen
                name="Logout"
                component={EmptyChild} // empty screen just to trigger logout
                listeners={({ navigation }) => ({
                    focus: async () => {
                        await AsyncStorage.removeItem('user');
                        Alert.alert('Logged out');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                })}
            />
        </Drawer.Navigator>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator>
                    {/* Hide header for login/signup/main */}
                    <Stack.Screen
                        name="Login"
                        component={LoginPage}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Signup"
                        component={SignupPage}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Main"
                        component={DrawerRoutes}
                        options={{ headerShown: false }}
                    />

                    {/* Show header for complaint details */}
                    <Stack.Screen
                        name="ComplaintDetails"
                        component={ComplaintDetailsPage}
                        options={{ title: "Complaint Details" }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}
