import { getFirestore } from "@firebase/firestore";
import { firebaseApp } from "../firebase";

const db = firebaseApp ? getFirestore(firebaseApp) : null;

export default db;
