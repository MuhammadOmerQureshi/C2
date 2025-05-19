const { writeFileSync } = require('fs');
const { createEvent } = require('ics');

const generateICS = (eventDetails) => {
  const { title, description, location, start, end } = eventDetails;

  const event = {
    start, // [year, month, day, hour, minute]
    end,   // [year, month, day, hour, minute]
    title,
    description,
    location,
  };

  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) {
        console.error('Error creating ICS file:', error);
        return reject(error);
      }

      // Save the ICS file to the server (optional)
      const filePath = `./temp/${title.replace(/\s+/g, '_')}.ics`;
      writeFileSync(filePath, value);

      resolve({ filePath, icsContent: value });
    });
  });
};

module.exports = generateICS;