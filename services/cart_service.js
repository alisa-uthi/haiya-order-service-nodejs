const connection = require("../config/database");

export const getCartByCartId = async (cartId) => {
  let query = "SELECT * FROM Cart WHERE ID = ? ;";

  try {
    const result = await connection.promise().execute(query, [cartId]);
    return result[0][0];
  } catch (error) {
    throw new Error(`Get Cart By Cart ID: ${error.message}`);
  }
};

export const getCartByUserId = async (userId) => {
  let query = "SELECT * FROM Cart WHERE Psn_ID = ? AND Flag_Delete = FALSE;";

  try {
    const result = await connection.promise().execute(query, [userId]);
    return result[0][0];
  } catch (error) {
    throw new Error(`Get Cart By User ID: ${error.message}`);
  }
};

export const getCartItemsByCartId = async (cartId) => {
  let query = "SELECT * FROM Cart_Item WHERE Cart_ID = ? ;";

  try {
    const result = await connection.promise().execute(query, [cartId]);
    return result[0];
  } catch (error) {
    throw new Error(`Get Cart Item By Cart ID: ${error.message}`);
  }
};

export const createCartByUserId = async (userId, pharmacyId) => {
  let query = "INSERT INTO Cart (Psn_ID, Pcy_ID) VALUES(?, ?);";
  try {
    const result = await connection
      .promise()
      .execute(query, [userId, pharmacyId]);
    return result[0].insertId;
  } catch (error) {
    throw new Error(`Create Cart By User Id: ${error.message}`);
  }
};

export const createCartItemByCartId = async (cartId, item) => {
  let query =
    "INSERT INTO Cart_Item (Cart_ID, Prd_ID, Prd_Qty, Total_Cost, Comment) ";
  query += "VALUES(?, ?, ?, ?, ?);";

  try {
    await connection
      .promise()
      .execute(query, [
        cartId,
        item.productId,
        item.quantity,
        item.totalCost,
        item.comment,
      ]);
  } catch (error) {
    throw new Error(`Create Cart By User Id: ${error.message}`);
  }
};

export const updateFlagDeleteByCartId = async (cartId, flagDelete) => {
  let query = "UPDATE Cart SET Flag_Delete = ? WHERE ID = ? ;";

  try {
    await connection.promise().execute(query, [flagDelete, cartId]);
  } catch (error) {
    throw new Error(`Update Flag Delete By Cart ID: ${error.message}`);
  }
};
