import * as firebase from 'firebase';
require('@firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAA7lJb8_pumikMv_eHJmfGjvrywwn_TsU",
    authDomain: "wireless-lib-85e5c.firebaseapp.com",
    projectId: "wireless-lib-85e5c",
    storageBucket: "wireless-lib-85e5c.appspot.com",
    messagingSenderId: "249280172547",
    appId: "1:249280172547:web:70cd6a0443b56f74e1b436"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();