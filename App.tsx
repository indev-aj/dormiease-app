import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './screens/LoginPage';
import SignupPage from './screens/SignupPage';
import RoomApplicationPage from './screens/RoomApplicationPage';
import ComplaintListPage from './screens/ComplaintListPage';
import NewComplaintPage from './screens/NewComplaintPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Signup" component={SignupPage} />
        <Stack.Screen name="Rooms" component={RoomApplicationPage} />
        <Stack.Screen name="Complaints" component={ComplaintListPage} />
        <Stack.Screen name="SubmitComplaint" component={NewComplaintPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}