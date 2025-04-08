const PhoneNumber = require("../models/phonenumberModel");

exports.createPhoneNumber = async (req, res) => {
  const { provider, number, twilioAccountSid, twilioAuthToken, name, userId, assistantId } = req.body;
  
  // Validate required fields
  if (!provider || !number || !twilioAccountSid || !twilioAuthToken || !name || !assistantId) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  // Validate userId is present
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  
  try {
    // Check if the phone number already exists in the database
    const existingPhoneNumber = await PhoneNumber.findOne({ number });
    if (existingPhoneNumber) {
      return res.status(409).json({ error: "Phone number already exists in the database" });
    }
    
    // Prepare data for VAPI (excluding userId)
    const vapiPayload = {
      provider,
      number,
      twilioAccountSid,
      twilioAuthToken,
      name,
      assistantId,
    };
    
    // Make API call to VAPI
    const response = await fetch("https://api.vapi.ai/phone-number", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
      },
      body: JSON.stringify(vapiPayload),
    });
    
    // Parse the response data
    const data = await response.json();
    vapiId=data.id; 
    // Handle non-OK responses from VAPI
    if (!response.ok) {
      // Check for specific error message from VAPI
      if (data.statusCode === 400 && data.message) {
        return res.status(400).json({
          error: "Bad Request",
          message: data.message, // Include the specific error message from VAPI
        });
      }
      
      // Handle other errors from VAPI
      return res.status(response.status).json({
        error: "Failed to create phone number with VAPI",
        details: data,
      });
    }
    
    // Combine VAPI response data with userId for our database
    const phoneNumberData = {
      ...data,
      vapiId,
      userId // Add userId to the phone number data
    };
    
    // Save the phone number in the database
    const phoneNumber = new PhoneNumber(phoneNumberData);
    await phoneNumber.save();
    
    // Return success response
    res.status(201).json({
      message: "Phone number created successfully",
      data: phoneNumber,
    });
  } catch (error) {
    console.error("Error creating phone number:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

exports.fetchPhoneNumbers = async (req, res) => {
  try {
    const response = await fetch("https://api.vapi.ai/phone-number", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
      },
    });
    const data = await response.json();

    // Send the phone numbers back to the client
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching phone numbers from VAPI:", error.message);
    res.status(500).json({
      error: "Failed to fetch phone numbers from VAPI.",
      details: error.message,
    });
  }
};

exports.fetchPhoneNumbersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Step 1: Fetch all phone numbers from VAPI
    const vapiResponse = await fetch("https://api.vapi.ai/phone-number", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
      },
    });
    
    if (!vapiResponse.ok) {
      return res.status(vapiResponse.status).json({ 
        error: "Failed to fetch phone numbers from VAPI" 
      });
    }
    
    const vapiPhoneNumbers = await vapiResponse.json();
    
    // Step 2: Sync VAPI data with our database
    for (const vapiPhone of vapiPhoneNumbers) {
      // Check if this phone number exists in our database
      const existingPhone = await PhoneNumber.findOne({ vapiId: vapiPhone.id });
      
      if (!existingPhone) {
        // This is a new phone number from VAPI, but we don't know the userId yet
        // We'll store it with a null userId and it can be claimed later
        const newPhoneNumber = new PhoneNumber({
          vapiId: vapiPhone.id,
          provider: vapiPhone.provider,
          number: vapiPhone.number,
          twilioAccountSid: vapiPhone.twilioAccountSid,
          twilioAuthToken: vapiPhone.twilioAuthToken,
          name: vapiPhone.name,
          assistantId: vapiPhone.assistantId, // Store the assistantId from VAPI
          userId: null // Unknown user at this point
        });
        
        await newPhoneNumber.save();
      } else {
        // Update existing record with latest data from VAPI
        existingPhone.provider = vapiPhone.provider;
        existingPhone.number = vapiPhone.number;
        existingPhone.name = vapiPhone.name;
        
        // Only update assistantId if it's not already set in our database
        if (!existingPhone.assistantId && vapiPhone.assistantId) {
          existingPhone.assistantId = vapiPhone.assistantId;
        }
        
        // Don't update userId as that's our internal association
        await existingPhone.save();
      }
    }
    
    // Step 3: Fetch phone numbers for the specific userId from our database
    const userPhoneNumbers = await PhoneNumber.find({ userId });
    
    // Step 4: Enhance our database records with additional VAPI data if needed
    const enhancedPhoneNumbers = userPhoneNumbers.map(phone => {
      const vapiData = vapiPhoneNumbers.find(vp => vp.id === phone.vapiId);
      if (vapiData) {
        return {
          ...phone.toObject(),
          id: phone.vapiId, // Use the VAPI ID as the id field for frontend consistency
          // Use our database assistantId if available, otherwise fall back to VAPI's value
          assistantId: phone.assistantId || vapiData.assistantId || null,
        };
      }
      return phone;
    });
    
    res.status(200).json(enhancedPhoneNumbers);
  } catch (error) {
    console.error("Error fetching user phone numbers:", error.message);
    res.status(500).json({
      error: "Failed to fetch phone numbers",
      details: error.message,
    });
  }
};

exports.updatePhoneNumberAssistant = async (req, res) => {
  try {
    const { phoneId, assistantId } = req.body;
    
    if (!phoneId || !assistantId) {
      return res.status(400).json({ error: "Phone ID and Assistant ID are required" });
    }
    
    // Update in VAPI - removing the provider property that's causing the error
    const vapiResponse = await fetch(`https://api.vapi.ai/phone-number/${phoneId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VAPI_TOKEN}`,
      },
      body: JSON.stringify({
        // Only include assistantId, removing provider
        "assistantId": assistantId
      }),
    });
    
    if (!vapiResponse.ok) {
      const errorData = await vapiResponse.json();
      return res.status(vapiResponse.status).json({
        error: "Failed to update phone number in VAPI",
        details: errorData,
      });
    }
    
    // If successful in VAPI, update in our database too
    const phoneNumber = await PhoneNumber.findOne({ vapiId: phoneId });
    if (phoneNumber) {
      // Update the assistantId in our database
      phoneNumber.assistantId = assistantId;
      await phoneNumber.save();
    } else {
      console.warn(`Phone number with vapiId ${phoneId} not found in database`);
    }
    
    res.status(200).json({
      message: "Phone number assistant updated successfully",
      phoneId,
      assistantId,
    });
  } catch (error) {
    console.error("Error updating phone number assistant:", error.message);
    res.status(500).json({
      error: "Failed to update phone number assistant",
      details: error.message,
    });
  }
};

exports.deletePhoneNumber = async (req, res) => {
  try {
    const { id } = req.params; // This should be the VAPI ID of the phone number
    
    if (!id) {
      return res.status(400).json({ error: "Phone number ID is required" });
    }
    
    // Step 1: Delete the phone number from VAPI
    const vapiResponse = await fetch(`https://api.vapi.ai/phone-number/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${process.env.VAPI_TOKEN}`,
      },
    });
    
    if (!vapiResponse.ok) {
      const errorData = await vapiResponse.json();
      return res.status(vapiResponse.status).json({
        error: "Failed to delete phone number from VAPI",
        details: errorData,
      });
    }
    
    // Step 2: If successful with VAPI, delete from our database
    const deletedPhoneNumber = await PhoneNumber.findOneAndDelete({ vapiId: id });
    
    if (!deletedPhoneNumber) {
      // We still return success even if not found in our DB, as it was deleted from VAPI
      console.warn(`Phone number with vapiId ${id} not found in database`);
    }
    
    res.status(200).json({
      message: "Phone number deleted successfully",
      id,
    });
    
  } catch (error) {
    console.error("Error deleting phone number:", error.message);
    res.status(500).json({
      error: "Failed to delete phone number",
      details: error.message,
    });
  }
};
