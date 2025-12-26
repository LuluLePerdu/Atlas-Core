const express = require('express')
const router = express.Router()
const caldavService = require('../services/caldavService')
const authMiddleware = require('../middleware/authMiddleware')

// CalDAV requires specific HTTP methods
// Basic CalDAV discovery endpoint
router.options('/*', (req, res) => {
  res.set({
    'DAV': '1, 2, calendar-access',
    'Allow': 'OPTIONS, GET, HEAD, POST, PUT, DELETE, PROPFIND, REPORT',
    'Content-Type': 'text/html'
  })
  res.sendStatus(200)
})

// Calendar subscription endpoint (works with iOS Calendar)
router.get('/calendar.ics', authMiddleware, async (req, res) => {
  try {
    const calendar = await caldavService.generateFullCalendar(req.user.userId)
    
    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="atlas-calendar.ics"'
    })
    
    res.send(calendar.toString())
  } catch (error) {
    console.error('CalDAV error:', error)
    res.status(500).json({ error: 'Failed to generate calendar' })
  }
})

// Week-specific calendar export
router.get('/week/:weekStartDate', authMiddleware, async (req, res) => {
  try {
    const { weekStartDate } = req.params
    const calendar = await caldavService.generateCalendar(req.user.userId, weekStartDate)
    
    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="atlas-week-${weekStartDate}.ics"`
    })
    
    res.send(calendar.toString())
  } catch (error) {
    console.error('CalDAV error:', error)
    res.status(500).json({ error: 'Failed to generate calendar' })
  }
})

// PROPFIND - Required for CalDAV discovery
router.propfind('/*', authMiddleware, async (req, res) => {
  const depth = req.headers.depth || '0'
  
  // Basic PROPFIND response
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<d:multistatus xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:response>
    <d:href>/caldav/calendar.ics</d:href>
    <d:propstat>
      <d:prop>
        <d:resourcetype>
          <d:collection/>
          <cal:calendar/>
        </d:resourcetype>
        <d:displayname>Atlas Weekly Planner</d:displayname>
        <cal:calendar-description>Your weekly schedule from Atlas Core</cal:calendar-description>
        <cal:supported-calendar-component-set>
          <cal:comp name="VEVENT"/>
        </cal:supported-calendar-component-set>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>`

  res.set('Content-Type', 'application/xml; charset=utf-8')
  res.status(207).send(response)
})

// REPORT - For calendar queries
router.report('/*', authMiddleware, async (req, res) => {
  try {
    const calendar = await caldavService.generateFullCalendar(req.user.userId)
    
    const response = `<?xml version="1.0" encoding="UTF-8"?>
<d:multistatus xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:response>
    <d:href>/caldav/calendar.ics</d:href>
    <d:propstat>
      <d:prop>
        <cal:calendar-data>${calendar.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</cal:calendar-data>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>`

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.status(207).send(response)
  } catch (error) {
    console.error('CalDAV REPORT error:', error)
    res.status(500).json({ error: 'Failed to process calendar query' })
  }
})

module.exports = router
