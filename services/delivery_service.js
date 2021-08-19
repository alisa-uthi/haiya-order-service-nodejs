const connection = require('../config/database')

export const getDeliveryByOrderId = async (orderId) => {
    let query = 'SELECT d.*, o.Ord_OrderStatus FROM Delivery d '
    query += 'INNER JOIN `Order` o ON o.ID = d.Ord_ID '
    query += 'WHERE Ord_ID = ? ;'

    try {
        const result = await connection.promise().execute(query, [ orderId ])
        return result[0][0]
    } catch (error) {
        throw new Error(`Get Delivery By Order ID: ${error.message}`)
    }
}

export const insertDelivery = async (orderId, userId) => {
    let query = 'INSERT INTO Delivery (Ord_ID, Psn_ID) '
    query += 'VALUES (?, ?);'

    try {
        const result = await connection.promise().execute(query, [ orderId, userId ])
        return result[0].affectedRows
    } catch (error) {
        throw new Error(`Insert New Delivery By Order ID: ${error.message}`)
    }
}