const connection = require('../config/database')
const axios = require('axios')
const { OrderStatus } = require('../constants/order_status')

export const getOrderHistoryByUserId = async (userId) => {
    let query = 'SELECT * FROM `Order` WHERE Ord_Psn_ID = ? AND Ord_OrderStatus = ? '
    query += 'ORDER BY Ord_PayTimestamp DESC;'

    try {
        const result = await connection.promise().execute(query, [ userId, OrderStatus.DELIVERED ])
        return result[0]
    } catch (error) {
        throw new Error(`Get Order History By User Id: ${error.message}`)
    }
}

export const createOrderByUserId = async (userId, data) => {
    let query = 'INSERT INTO `Order` '
    query += '(Ord_DelAddr, Ord_DelPrice, Ord_PayTimestamp, Ord_OrderStatus, Ord_Psn_ID, Ord_Pharmacy) '
    query += 'VALUES (?, ?, NOW(), ?, ?, ?);'

    try {
        const result = await connection.promise().execute(
            query,
            [
                data.deliveryAddress, data.deliveryPrice,
                OrderStatus.CREATED, userId, data.pharmacy
            ],
        )
        return result[0].insertId
    } catch (error) {
        throw new Error(`Create Order By User Id: ${error.message}`)
    }
}

export const createOrderLine = async (orderId, item) => {
    let query = 'INSERT INTO Order_Line (Ord_ID, Prd_ID, Order_Qty, Total_Cost, Comment) '
    query += 'VALUES (?, ?, ?, ?, ?);'

    try {
        await connection.promise().execute(
            query,
            [ orderId, item.productId, item.quantity, item.totalCost, item.comment ],
        )
    } catch (error) {
        throw new Error(`Create Order Lines By Order Id: ${error.message}`)
    }
}

export const getOrderByOrderId = async (orderId) => {
    let query = 'SELECT * FROM `Order` WHERE ID = ? ;'

    try {
        let result = await connection.promise().execute(query, [ orderId ])
        return result[0][0]
    } catch (error) {
        throw new Error(`Get Order By Order Id: ${error.message}`)
    }
}

export const getOrderByOrderStatus = async (status, userId) => {
    let query = 'SELECT * FROM `Order` WHERE Ord_OrderStatus = ? AND Ord_Psn_ID = ? ;'

    try {
        let result = await connection.promise().execute(query, [ status.toUpperCase(), userId ])
        return result[0]
    } catch (error) {
        throw new Error(`Get Order By Order Id: ${error.message}`)
    }
}

export const getOrderLinesByOrderId = async (orderId, authorizationToken) => {
    let query = 'SELECT * FROM `Order_Line` WHERE Ord_ID = ?;'

    try {
        const result = await connection.promise().execute(query, [ orderId ])
        let orderLines = result[0]

        if(orderLines) {
            // Get product name of each order line
            for (const index in orderLines) {
                let product = await axios.get(
                    `http://inventory-service:8001/product/${orderLines[index].Prd_ID}`,
                    {
                        headers: {
                            Authorization: authorizationToken,
                        }
                    }
                )
                orderLines[index].Prd_TradeName = product.data.data.Prd_TradeName
                orderLines[index].Prd_Image = product.data.data.Prd_Image
            }
        }

        return orderLines
    } catch (error) {
        throw new Error(`Get Order Lines By Order Id: ${error.message}`)
    }
}

export const updateOrderStatus = async (orderId, status) => {
    let query = 'UPDATE `Order` SET Ord_OrderStatus = ? WHERE ID = ? ;'

    try {
        const result = await connection.promise().execute(query, [ status.toUpperCase(), orderId ])
        return result[0].affectedRows
    } catch (error) {
        throw new Error(`Update Order Status By Order Id: ${error.message}`)
    }
}