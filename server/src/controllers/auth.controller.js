export const registerUser = async(req,res) => {
  try {
    console.log(req.body);

    return res.status(201).json(
      {
        success: true,
        messege: "Register API working",
        data: req.body
      }
    );
  } catch (error) {
    
    return res.status(500).json(
      {
        success: false,
        messege: "Internal Service error"
      }
    );
  }
};