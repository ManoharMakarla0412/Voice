


// Handle appointment booking
exports.createAppointment = async (req, res) => {
 console.log("Recieved Request: ", req.body);
  res.status(200).json({req.body});
};
