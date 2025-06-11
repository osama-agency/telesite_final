// Health check endpoint
export async function GET() {
  try {
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'telesite-api'
    }, {
      status: 200
    })
  } catch (error) {
    return Response.json({
      status: 'error',
      message: 'Service unavailable'
    }, {
      status: 503
    })
  }
}
