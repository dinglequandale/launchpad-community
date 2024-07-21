import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export const saveHighSchooler = async (highSchoolerData) => {
    try {
        const dataWithUserType = {
            userType: 'highSchooler',
            ...highSchoolerData
        };

        const docRef = await addDoc(collection(db, 'users'), dataWithUserType);
        console.log("High Schooler info saved -- written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveCollegeStudent = async () => {
    try {
        const dataWithUserType = {
            userType: 'collegeStudent',
            ...highSchoolerData
        };

        const docRef = await addDoc(collection(db, 'users'), dataWithUserType);
        console.log("High Schooler info saved -- written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveProfessional = async () => {
    try {
        const dataWithUserType = {
            userType: 'professional',
            ...highSchoolerData
        };

        const docRef = await addDoc(collection(db, 'users'), dataWithUserType);
        console.log("High Schooler info saved -- written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};