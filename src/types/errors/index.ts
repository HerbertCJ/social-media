class CustomError extends Error {
    statusCode: number
    info: any
    constructor(message:string, info = null) {
        super(message)
        this.name = 'CustomError'
        this.message = message
        this.statusCode = 500
        this.info = info
    }
}

class InternalServerError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'InternalServerError'
    }
}

class BadGatewayError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'BadGatewayError'
        this.statusCode = 502
    }
}

class BadRequestError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'BadRequestError'
        this.statusCode = 400
    }
}

class UnauthorizedError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'UnauthorizedError'
        this.statusCode = 401
    }
}

class ForbiddenError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'ForbiddenError'
        this.statusCode = 403
    }
}

class NotFoundError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'NotFoundError'
        this.statusCode = 404
    }
}

class ConflictError extends CustomError {
    constructor(message:string, info = null) {
        super(message, info)
        this.name = 'ConflictError'
        this.statusCode = 409
    }
}

export {
    InternalServerError,
    BadGatewayError,    
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,    
}
