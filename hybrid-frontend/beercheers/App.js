import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './app/index'; 
import Login from './app/login';
import BarsIndexMap from './app/BarsIndexMap';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="index" component={Home} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="BarsIndexMap" component={BarsIndexMap} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;