export default function errorHandlerMiddleware() {
    return (error, req, res, next) => {
        const status = error.status || 'error'

        console.log(`[Global Error Handler] ${error.message || error.name}`, { error, stack: error.stack })

        res.status(error.statusCode || 500).json({
            status,
            message: error instanceof Error ? error.message : String(error),
        })
    }
}
