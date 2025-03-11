// Handle appointment booking
exports.createAppointment = async (req, res) => {
    console.log("Received Request:");
    Object.keys(req.body).forEach(key => {
        console.log(`${key}: ${req.body[key]}`);
    });
    res.status(200).json(req.body);
};
