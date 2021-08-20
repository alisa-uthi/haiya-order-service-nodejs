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
    query += '(Ord_DelAddr, Ord_DelPrice, Ord_PayTimestamp, Ord_Comment, Ord_OrderStatus, Ord_Psn_ID, Ord_Pharmacy) '
    query += 'VALUES (?, ?, NOW(), ?, ?, ?, ?);'

    try {
        const result = await connection.promise().execute(
            query, 
            [ 
                data.deliveryAddress, data.deliveryPrice, data.comment, 
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
        // Get order by id
        let order = await connection.promise().execute(query, [ orderId ])
        let result = order[0][0]

        if(result) {
            // Get delivery address of the order
            const address = await axios.get(`http://user-profile-service:8000/address/${result.Ord_DelAddr}`) 
            result.Delivery_Address = address.data.data.Addr_Location
        }
        
        return result
    } catch (error) {
        throw new Error(`Get Order By Order Id: ${error.message}`)
    }
}

export const getOrderLinesByOrderId = async (orderId) => {
    let query = 'SELECT * FROM `Order_Line` WHERE Ord_ID = ?;'

    try {
        const result = await connection.promise().execute(query, [ orderId ])
        let orderLines = result[0]

        if(orderLines) {
            // Get product name of each order line
            for (const index in orderLines) {
                let product = await axios.get(`http://inventory-service:8001/product/${orderLines[index].Prd_ID}`) 
                orderLines[index].productName = product.data.data.Prd_TradeName
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