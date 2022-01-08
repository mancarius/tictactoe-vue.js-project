import { Firestore, getFirestore } from "@firebase/firestore";
import { firebaseApp } from "../firebase";

console.log({ firebaseApp });

const db = firebaseApp ? getFirestore(firebaseApp) : null;

export default db;
