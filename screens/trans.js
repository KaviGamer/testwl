import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config';
import Toast from 'react-native-simple-toast';

export default class TransScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transMess:null
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
    }

    submit = async()=>{
      var transactionType = await this.checkEligibility();

      if (!transactionType) {
        Alert.alert("The book doesn't exist in the library database!");
        this.setState({
          scannedStudentId: "",
          scannedBookId: ""
        });
      } else if (transactionType === "Issue") {
        var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
        if (isStudentEligible) {
          this.issueBook();
          Alert.alert("Book issued to the student!");
        }
      } else {
        var isStudentEligible = await this.checkStudentEligibilityForReturn();
        if (isStudentEligible) {
          this.returnBook();
          Alert.alert("Book returned to the library!");
        }
      }
    }; 

    checkStudentEligibilityForBookIssue = async()=>{
      var studentRef = db.collection("students")
      .where("studentID","==",this.state.scannedStudentId)
      .get();
      var studEll="";
      if(studentRef.docs.length===0){
        studEll=false;
        Toast.show("Student Does Not Exist Pls Use A Valid StudentID",Toast.LONG);
            this.setState({
              scannedStudentId:'',
              scannedbookId:'',
            })
      }else{
        studentRef.docs.map(doc=>{
          var student = doc.data();
          if(studen.booksIssue<2){
            studEll=true;
          }else{
            studEll=false;
            Toast.show("Student already has two books, he or she's not supposed to be given the book even if he or she begs!",Toast.LONG);
            this.setState({
              scannedStudentId:'',
              scannedbookId:'',
            })
          }
          }
        )
      }
    }

    checkStudentEligibilityForReturn = async () => {
      const transactionRef = await db
        .collection("transactions")
        .where("bookID", "==", this.state.scannedBookId)
        .limit(1)
        .get();
      var isStudentEligible = "";
      transactionRef.docs.map(doc => {
        var lastBookTransaction = doc.data();
        if (lastBookTransaction.studentID === this.state.scannedStudentId) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          Alert.alert("The book wasn't issued by this student!");
          this.setState({
            scannedStudentId: "",
            scannedBookId: ""
          });
        }
      });
      return isStudentEligible;
    };

    checkEligibility=async()=>{
      var bookRef = db.collection("books")
      .where("bookID","==",this.state.scannedBookId)
      .get();
      var transactionType="";
      if(bookRef.docs.length===0){
        transactionType=false;
      }else{
        bookRef.docs.map(doc=>{
          var book = doc.data();
          if(book.bookAvailabilty===true){
            transactionType="issue";
          }else{
            transactionType="return";
          }
          }
        )
      }
      return transactionType;
    }

    issueBook = async()=>{
      db.collection("transactions").add({
        bookId:this.state.scannedBookId,
        date:firebase.firestore.TimeStamp.now().toDate(),
        studentID:this.state.scannedStudentId,
        transactionType:"issue"
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        bookAvailabilty:false
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        booksIssued:firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scannedBookId:'',
        scannedStudentId:''
      })
    }

    returnBook = async()=>{
      db.collection("transactions").add({
        bookId:this.state.scannedBookId,
        date:firebase.firestore.TimeStamp.now().toDate(),
        studentID:this.state.scannedStudentId,
        transactionType:"return"
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        bookAvailabilty:true
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        booksIssued:firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scannedBookId:'',
        scannedStudentId:''
      })
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              onChangeText={
                book=>{
                  this.setState({
                    scannedbookId:book
                  })
                }
              }
              placeholder="Book Id"
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              onChangeText={
                student=>{
                  this.setState({
                    scannedStudentId:student
                  })
                }
              }
              placeholder="Student Id"
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={{
              backgroundColor: '#FBC02D', 
              width: 100, 
              height:50
            }}
            onPress = {
              async()=>{
                var transMess = await this.submit();
              }
            }
            >
              <Text style = {{ padding: 10, 
                textAlign: 'center', 
                fontSize: 20, 
                fontWeight:"bold", 
                color: 'white'}}>
                  SUBMIT
                  </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });