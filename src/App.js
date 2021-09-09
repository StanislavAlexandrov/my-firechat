import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useState, useRef } from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { signOut } from '@firebase/auth';

firebase.initializeApp({
    apiKey: 'AIzaSyD4KIc2J5ryOBFgVA1_vUU0zY1RwWkJ9Sk',
    authDomain: 'my-firechat-63870.firebaseapp.com',
    projectId: 'my-firechat-63870',
    storageBucket: 'my-firechat-63870.appspot.com',
    messagingSenderId: '662619388716',
    appId: '1:662619388716:web:d78d5ec09ee82dba050a89',
});

const auth = firebase.auth();

const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };
    return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
    return (
        auth.currentUser && (
            <button onClick={() => auth.signOut()}>Sign Out</button>
        )
    );
}
//bug: ClearCollection only works the first time, so I've removed it.
function ClearCollection(path) {
    const ref = firestore.collection(path);
    ref.onSnapshot((snapshot) => {
        snapshot.docs.forEach((doc) => {
            ref.doc(doc.id).delete();
        });
    });
}

function ChatRoom() {
    const dummy = useRef();

    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <header>
                <SignOut />
            </header>
            <main>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                <div ref={dummy}></div>
            </main>
            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />
                <button type="submit">submit</button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} alt="this is a user" />
            <p>{text}</p>
        </div>
    );
}

export default App;
