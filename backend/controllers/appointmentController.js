exports.createAppointment = async (req, res) => {
    console.log("Received Request:", JSON.stringify(req.body, null, 2));
  
    try {
      const { message } = req.body;
      if (!message || message.type !== 'tool-calls' || !message.toolCalls || !message.toolCalls.length) {
        return res.status(400).json({ error: 'Invalid tool-calls message' });
      }
  
      const toolCall = message.toolCalls[0];
      if (toolCall.function.name !== 'AppointmentBooking') {
        return res.status(400).json({ error: 'Unexpected tool call' });
      }
  
      const args = toolCall.function.arguments;
      console.log('Tool call arguments:', JSON.stringify(args, null, 2));
  
      // Decode arguments (adjust based on actual Vapi output)
      const appointmentData = {
        fullName: args.fullName || args.name || args.additionalProp1 || 'Unknown',
        purpose: args.purpose || args.reason || args.additionalProp2 || 'General appointment',
        preferredDateTime: args.dateTime || args.time || args.additionalProp3 || 'Not specified',
        callId: message.call.id,
        assistantId: message.assistant.id,
        timestamp: new Date(message.timestamp),
      };
  
      res.status(200).json({
        message: 'Appointment booked successfully',
        appointment: appointmentData,
      });
    } catch (error) {
      console.error('Error processing appointment:', error.message);
      res.status(500).json({ error: 'Failed to process appointment', details: error.message });
    }
  };