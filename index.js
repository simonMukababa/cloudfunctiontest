/**
 * Triggered from a log sink message on a Cloud Pub/Sub topic which sends the payload to Gchat.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
const fetch = require('node-fetch');

exports.pubsubEvent = (event, context) => {
  //decode and parse the event payload to json	
  const PubSubMessage = event.data;
  const alertData = JSON.parse(Buffer.from(PubSubMessage, 'base64').toString());
  const SQLInstanceName = alertData.resource.labels.database_id;
  const project = alertData.resource.labels.project_id;
  const eventType =  alertData.labels.activity_type_name;
  const eventMessage = alertData.labels.verbose_message;
  
  const timestamp = alertData.timestamp;
  const date = new Date(timestamp); 
  const humanReadableDateTime = date.toLocaleString('en-GB', {dateStyle: 'short', timeStyle: 'short'});// Outputs "4/12/2023, 7:59:00 AM"
  const cpuUtilizationValue = parseFloat(alertData.labels.verbose_message.match(/value of (\d+\.\d+)/)[1]) * 100; // Extracts the CPU utilization value and converts it to a percentage
  const message = `
      *🚨 CloudSQL Resource Alerts <users/all>🚨 ${eventType}*
      *📊 CloudSQL Instance Name:* ${SQLInstanceName}
      *🆔 Event Type:* ${eventType} 
      *🔗 Events Message:* ${eventMessage}
      *🕰 Time:* ${humanReadableDateTime}
      *📂 Project:* ${project}
      *💻 CPU Utilization:* ${cpuUtilizationValue.toFixed(2)}%
  `;
  
  //Gchat notification using POST
  fetch(process.env.webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
    'text': message,
     })
  }).then((response) => {
    console.log(response);
  });
};