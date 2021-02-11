import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import db from '../config';
export default class SearchScreen extends Component {
  constructor(){
    super();
    this.setState({
      allTransactions:[],
    });
  }
  componentDidMount=async()=>{
    const transss = await db.collection("transactions").get();
    transss.docs.map((trans)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,trans.data()]
      });
    });
  }
  render() {
    return (
      <ScrollView style={styles.container}>
        {
          this.state.allTransactions.map((doc,index)=>{
            return(
              <View style = {{borderWidth:2}}
              key={index}
              >
          <Text>{
                 "Book ID = "+doc.bookID
          }</Text>
          <Text>{
                  "Date Last Issued = "+doc.date
          }</Text>
          <Text>{
                  "Student ID = "+doc.studentID
          }</Text>
          <Text>{
                  "Transaction Type = "+doc.transactionType
          }</Text>
              </View>
            )
          })}
        
          </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 100,

  }
})