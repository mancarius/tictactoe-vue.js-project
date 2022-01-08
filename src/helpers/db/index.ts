import { getFirestore } from "@firebase/firestore";
import { firebaseApp } from "../firebase";

const db = firebaseApp ? getFirestore(firebaseApp) : undefined;

export default db;
