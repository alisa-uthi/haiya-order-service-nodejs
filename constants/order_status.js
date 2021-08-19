const enumValue = (name) => Object.freeze({toString: () => name})

export const OrderStatus = Object.freeze({
    CREATED: enumValue("CREATED"),
    APPROVED: enumValue("APPROVED"),
    PREPARING: enumValue("PREPARING"),
    READY_FOR_PICKUP: enumValue("READY_FOR_PICKUP"),
    PICKED_UP: enumValue("PICKED_UP"),
    DELIVERED: enumValue("DELIVERED"),
    CANCELLED: enumValue("CANCELLED")
});