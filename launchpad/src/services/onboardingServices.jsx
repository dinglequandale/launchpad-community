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

export const saveCollegeStudent = async (collegeStudentData) => {
    try {
        const dataWithUserType = {
            userType: 'collegeStudent',
            ...collegeStudentData
        };

        const docRef = await addDoc(collection(db, 'users'), dataWithUserType);
        console.log("College Student info saved -- written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const saveProfessional = async (professionalData) => {
    try {
        const dataWithUserType = {
            userType: 'professional',
            ...professionalData
        };

        const docRef = await addDoc(collection(db, 'users'), dataWithUserType);
        console.log("Professional info saved -- written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};