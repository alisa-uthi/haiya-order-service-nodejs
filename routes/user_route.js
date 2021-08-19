const express = require('express')
const router = express.Router()
const upload = require('../config/multer')
const bucket = require('../config/firebase')

const userService = require('../services/user_service')
const drugAllergyService = require('../services/drug_allergy_service')
const congenitalDiseaseService = require('../services/congenital_service')

// Get User by ID
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId

        const user = await userService.getUserById(userId)
        const drugAllergy = await drugAllergyService.getDrugAlleryByUserId(userId)
        const congenitalDisease = await congenitalDiseaseService.getCongenitalDisByUserId(userId)
        
        const result = {
          user,
          drugAllergy,
          congenitalDisease
        }

        res.status(200).json({ data: result })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update User General Information by ID
router.put('/:userId', async (req, res) => {
  try {
      const userId = req.params.userId

      await userService.updatePerson(req.body, userId)
      const result = await userService.getUserById(userId)
      
      res.status(200).json({ data: result })
  } catch (error) {
      res.status(500).json({ error: error.message })
  }
})

// Update profile image
router.patch('/:userId/image', upload.single('image'), async (req, res) => {
  const folder = 'profile'
  const fileName = `${Date.now()}${req.file.originalname}`
  const filePath = `${folder}/${fileName}`
  const fileUpload = bucket.file(filePath);
  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });
 
  blobStream.on('error', (error) => {
    res.status(405).json({ error: error.message });
  });

  blobStream.on('finish', async () => {
    try {
      const options = {
        action: 'read',
        expires: '12-31-2030'
      };
      var url = await fileUpload.getSignedUrl(options)
      const result = await userService.updateProfileImage(req.params.userId, url[0])
      res.status(200).json({ data: result })
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  });

  blobStream.end(req.file.buffer);
})

// Get profile image
router.get('/:userId/image', async (req, res) => {
    try {
      const result = await userService.getProfileImage(req.params.userId)
      res.status(200).json({ data: result })
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
})

// Update user password
router.patch('/:userId/password', async (req, res) => {
  try {
    await userService.updateUserPassword(req.params.userId, req.body.newPassword)
    res.status(200).json({ data: "Your password has been updated." })
  } catch(error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router