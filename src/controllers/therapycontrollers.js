const Therapy_ = require('../models/therapymodel');

// create therapy 
const createTherapy = async (req,res)=>{
    try{
    const therapyImage = req.file?.path ? req.file.path : undefined;

        const durationNum = req.body?.duration != null ? Number(req.body.duration) : undefined;
        const priceNum = req.body?.therapyprice != null ? Number(req.body.therapyprice) : undefined;

        if (!durationNum || durationNum <= 0) {
          return res.status(400).json({ message: "duration (minutes) is required and must be > 0" });
        }

        if (priceNum == null || Number.isNaN(priceNum) || priceNum < 0) {
          return res.status(400).json({ message: "therapyprice is required and must be >= 0" });
        }

        const newtherapy = await Therapy_.create({
          therapyName: req.body.therapyName,
          category: req.body.category,
          duration: durationNum,
          therapyprice: priceNum,
          ...(therapyImage ? { therapyImage } : {}),
        });
        res.status(201).json(newtherapy);

    }catch(error){
        res.status(500).json({message:"error creating therapy" ,   error:error.message});
    }
};


//get all therapies 

const getTherapies = async (req,res)=>{
try{
    const therapies = await Therapy_.find();
    res.json(therapies);
}catch(error) {res.status(500).json({ message: "Error fetching therapies" });}

};


// search + filter + sort
const parameters_Therapies = async (req,res)=>{
    try{

        const {search, category, duration, sort} = req.query

        let findings = {}

        // SEARCH
        if(search){
            findings.therapyName = {$regex: search, $options:"i"}
        }

        // FILTER CATEGORY
        if(category){
            findings.category = category
        }

        // FILTER DURATION
        if(duration){
            findings.duration = Number(duration)
        }

        let query = Therapy_.find(findings)  //final query in mongodb willbe -> findings={ category:"Massage", duration:60}

        // SORT
        if(sort){
            query = query.sort(sort)
        }

        const therapies = await query  // when u give await query runs  then mongodb applies search , filter sort and store result  

        res.status(200).json(therapies)

    }catch(error){
        res.status(500).json({message:"error fetching therapies", error:error.message})
    }
}



//update therapy 

const updatetherapy = async (req,res)=>{
try{
 const therapyImage = req.file?.path ? req.file.path : undefined;
  
  // Prepare update data
  const updateData = { ...req.body };
  
  // Add new image if uploaded
  if (therapyImage) {
    updateData.therapyImage = therapyImage;
  }
  
  // Convert numeric fields
  if (updateData.duration != null) {
    const durationNum = Number(updateData.duration);
    if (durationNum <= 0) {
      return res.status(400).json({ message: "duration (minutes) must be > 0" });
    }
    updateData.duration = durationNum;
  }
  
  if (updateData.therapyprice != null) {
    const priceNum = Number(updateData.therapyprice);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "therapyprice must be >= 0" });
    }
    updateData.therapyprice = priceNum;
  }

  const Therapy = await Therapy_.findByIdAndUpdate(
    req.params.id,
    updateData,
    {new:true}
  );
  res.json(Therapy);
}catch(err){res.status(500).json({ message: "Update failed" });}
};


//delete therapy 

const deletetherapy = async (req,res)=>{
    try{
       await  Therapy_.findByIdAndDelete(req.params.id);
        res.json({message:"Therapy deleted sucessfully"})
    }catch(err){
        res.status(500).json({message:"delete operation failed"});
    }
};

module.exports = {createTherapy,getTherapies,updatetherapy,deletetherapy,parameters_Therapies};