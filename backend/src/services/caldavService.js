const ical = require('ical-generator')
const { v4: uuidv4 } = require('uuid')
const db = require('../config/database')

class CalDAVService {
  // Convert calendar blocks to iCalendar format
  async generateCalendar(userId, weekStartDate) {
    const calendar = ical({
      prodId: { company: 'Atlas Core', product: 'Planner' },
      name: 'Atlas Weekly Planner',
      timezone: 'America/New_York'
    })

    // Fetch blocks for the user
    const blocks = await db('calendar_blocks')
      .where({ user_id: userId, week_start_date: weekStartDate })
      .orderBy('start_time')

    // Convert blocks to events
    blocks.forEach(block => {
      calendar.createEvent({
        id: block.id,
        start: new Date(block.start_time),
        end: new Date(block.end_time),
        summary: block.title,
        description: block.notes || '',
        location: '',
        categories: [{ name: block.type }],
        status: 'CONFIRMED'
      })
    })

    return calendar
  }

  // Generate calendar for all weeks (for calendar subscription)
  async generateFullCalendar(userId) {
    const calendar = ical({
      prodId: { company: 'Atlas Core', product: 'Planner' },
      name: 'Atlas Weekly Planner',
      timezone: 'America/New_York'
    })

    // Fetch all future blocks for the user (next 3 months)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    const blocks = await db('calendar_blocks')
      .where('user_id', userId)
      .where('start_time', '>=', new Date())
      .where('start_time', '<=', threeMonthsFromNow)
      .orderBy('start_time')

    blocks.forEach(block => {
      calendar.createEvent({
        id: block.id,
        start: new Date(block.start_time),
        end: new Date(block.end_time),
        summary: block.title,
        description: block.notes || '',
        location: '',
        categories: [{ name: block.type }],
        status: 'CONFIRMED'
      })
    })

    return calendar
  }

  // Get single event
  async getEvent(userId, eventId) {
    const block = await db('calendar_blocks')
      .where({ id: eventId, user_id: userId })
      .first()

    if (!block) return null

    const calendar = ical({
      prodId: { company: 'Atlas Core', product: 'Planner' },
      name: 'Atlas Weekly Planner',
      timezone: 'America/New_York'
    })

    calendar.createEvent({
      id: block.id,
      start: new Date(block.start_time),
      end: new Date(block.end_time),
      summary: block.title,
      description: block.notes || '',
      location: '',
      categories: [{ name: block.type }],
      status: 'CONFIRMED'
    })

    return calendar
  }
}

module.exports = new CalDAVService()
