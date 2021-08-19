const bcrypt = require('bcryptjs');
const connection = require('../config/database')

const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds)
}

export const insertPerson = async (data) => {
    let query = 'INSERT INTO Person (Psn_Title, Psn_Fname, Psn_Lname, Psn_DoB, Psn_Gender, Psn_Height, Psn_Weight, Psn_Email, Psn_Password, Psn_Phone) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    
    try {
        const hashedPassword = hashPassword(data.password)
  
        const result = await connection.promise().execute(
            query,
            [
                data.title, data.firstname, data.lastname, data.dob, data.gender, 
                data.height, data.weight, data.email, hashedPassword, data.phone,
            ],
        );
        return result[0].insertId
    } catch (err) {
        throw new Error(`Insert Person: ${err.message}`)
    }
}

export const updatePerson = async (data, userId) => {
    let query = 'UPDATE Person '
    query += 'SET Psn_Title = ?, Psn_Fname = ?, Psn_Lname = ?, Psn_DoB = ?, '
    query += 'Psn_Gender = ?, Psn_Height = ?, Psn_Weight = ?, '
    query += 'Psn_Email = ?, Psn_Phone = ? '
    query += 'WHERE ID = ? ;'
    
    try {
        const result = await connection.promise().execute(
            query,
            [
                data.title, data.firstname, data.lastname, data.dob, data.gender, 
                data.height, data.weight, data.email, data.phone, userId
            ],
        );
        return result[0][0]
    } catch (err) {
        throw new Error(`Update Person: ${err.message}`)
    }
}

export const getUserById = async (id) => {
    let query = ''
    query += 'SELECT ID, Psn_Title, Psn_Fname, Psn_Lname, Psn_DoB, Psn_Gender, Psn_Height, Psn_Weight, Psn_Email, Psn_Phone, Psn_Image '
    query += 'FROM Person WHERE ID = ?;'
    
    try {
        const result = await connection.promise().execute(
            query,
            [id],
        );
        return result[0][0]
    } catch (err) {
        throw new Error(`Get User by id: ${err.message}`)
    }
}

export const getUserByEmail = async (email) => {
    let query = 'SELECT ID, Psn_Email, Psn_Password FROM Person WHERE Psn_Email = ? ;'
    
    try {
        const result = await connection.promise().execute(
            query,
            [email],
        );
        return result[0][0]
    } catch (err) {
        throw new Error(`Get User By Email: ${err.message}`)
    }
}

export const updateProfileImage = async (id, imagePath) => {
    let query = 'UPDATE Person SET Psn_Image = ? WHERE ID = ? ;'
    
    try {
        const result = await connection.promise().execute(
            query,
            [imagePath, id],
        );
        return result[0][0]
    } catch (err) {
        throw new Error(`Update Profile Image: ${err.message}`)
    }
}

export const getProfileImage = async (id) => {
    let query = 'SELECT Psn_Image FROM Person WHERE ID = ? ;'
    
    try {
        const result = await connection.promise().execute(
            query,
            [id],
        );
        return result[0][0]
    } catch (err) {
        throw new Error(`Get Profile Image: ${err.message}`)
    }
}

export const updatetUserPassword = async (id, newPassword) => {
    let query = 'UPDATE Person Set Psn_Password = ? WHERE ID = ? ;'
    
    try {
        const hashedPassword = hashPassword(newPassword)
        await connection.promise().execute(
            query,
            [id, hashedPassword],
        );
    } catch (err) {
        throw new Error(`Update User Password: ${err.message}`)
    }
}

