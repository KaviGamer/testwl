import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

// You can import from local files
import TransScreen from './screens/trans';
import SearchScreen from './screens/search';

export default class App extends Component {
  render() {
    return (
      <View style={{flex:1}}>
        <Appcontainer />
      </View>
    )
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction : {
    screen:TransScreen
  },
  Search : {
    screen:SearchScreen
  }
},
{
  defaultNavigationOptions: ({navigation})=>({
    tabBarIcon: ()=>{
      const routeName = navigation.state.routeName;
      console.log(routeName)
      if(routeName === "Transaction"){
        return(
          <Image
          source={require("./assets/book.png")}
          style={{width:40, height:40}}
        />
        )
        
      }
      else if(routeName === "Search"){
        return(
          <Image
          source={require("./assets/searchingbook.png")}
          style={{width:40, height:40}}
        />)
      }
    }
  })
}
);
const Appcontainer = createAppContainer(TabNavigator);