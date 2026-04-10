function generateSlots(duration) {

  const startHour = 9
  const endHour = 18

  let slots = []

  let current = new Date()
  current.setHours(startHour,0,0,0)

  const end = new Date()
  end.setHours(endHour,0,0,0)

  // Only return start times that fully fit within business hours.
  // e.g. if duration=90, we should not offer 17:00 (would end 18:30).
  while (current.getTime() + duration * 60000 <= end.getTime()) {

    const hours = String(current.getHours()).padStart(2,"0")
    const minutes = String(current.getMinutes()).padStart(2,"0")

    slots.push(`${hours}:${minutes}`)

    current = new Date(current.getTime() + duration * 60000)

  }

  return slots
}

module.exports = generateSlots