const connection = require('../config/database')

export const getDeliveryByOrderId = async (orderId) => {
    let query = 'SELECT * FROM Delivery WHERE Ord_ID = ? ;'

    try {
        const result = await connection.promise().execute(query, [ orderId ])
        return result[0]
    } catch (error) {
        throw new Error(`Get Delivery By Order ID: ${error.message}`)
    }
}

export const insertDelivery = async (orderId, driverId, deliveryStatus) => {
    let query = 'INSERT INTO Delivery (Ord_ID, Driver_ID, Del_Status) '
    query += 'VALUES (?, ?, ?);'

    try {
        const result = await connection.promise().execute(
            query, 
            [ orderId, driverId, deliveryStatus ],
        )
        return result[0].affectedRows
    } catch (error) {
        throw new Error(`Insert New Delivery By Order ID: ${error.message}`)
    }
}