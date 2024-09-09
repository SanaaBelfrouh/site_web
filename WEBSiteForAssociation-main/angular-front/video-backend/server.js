const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/videoDatabase', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log('Connected to MongoDB');
    insertInitialData(); // Insert initial data when connected
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Define the schema and model
const domainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  videos: [
    {
      name: { type: String, required: true },
      type: { type: String, enum: ['drive_link', 'mp4'], required: true },
      link: String,
      file: String,
      definition: { type: String, required: true },
    },
  ],
});

const Domain = mongoose.model('Domain', domainSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// Function to insert initial data if the collection is empty
async function insertInitialData() {
  const count = await Domain.countDocuments();
  if (count === 0) {
    const initialDomains = [
      {
        name: 'تعابير متداولة',
        videos: [
            { 
                name: 'بِاسْمِ الله', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1916oVQ5-Vhjy0Y2-N8TlJKcrurk_4nck/preview', 
                definition: 'عبارة تُستخدم لبدء شيء ما.'
            },
            { 
                name: 'الحَمْدُ لله', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/18kt2iFgEOmkexpE8zOg3CxJ1brMBDg_y/preview', 
                definition: 'عبارة تعني "كل الحمد لله".'
            },
            { 
                name: 'السَّلَامُ عَلَيْكُم', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1C5tbjPMKLPDtEv_HWpMFey1JRTLJ6bOD/preview', // Replace 'your-file-id-3' with actual file ID
                definition: 'تحية تُستخدم عند اللقاء.'
            },
            { 
                name: 'كَيْفَ الحَال؟', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1epSei2Y2JIAy46ui32w4t6J-OsPo70CI/preview', // Replace 'your-file-id-4' with actual file ID
                definition: 'سؤال يُستخدم للاستفسار عن حالة الشخص.'
            },
            { 
                name: 'سُبْحَانَ الله', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1znuwexsKHkfivCJPInsr7LEPTjYMS-9t/preview', // Replace 'your-file-id-5' with actual file ID
                definition: 'عبارة تُستخدم للتعبير عن تعظيم الله.'
            },
            { 
                name: 'حفظك الله', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1tVZVxidUeeY6UGsxqtbf2_9Y9b91seuR/preview', // Replace 'your-file-id-6' with actual file ID
                definition: 'عبارة تُستخدم لشكر شخص على فعل حسن.'
            },
            { 
                name: 'شُكْرًا', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1ohw-t8oowLC3yNGO_yzfi5NgME4SjXnf/preview', // Replace 'your-file-id-7' with actual file ID
                definition: 'عبارة تُستخدم للتعبير عن الشكر.'
            },
            { 
                name: 'مَرْحَبًا', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1wI30wlBF-7NFjzZ7ZiJ-XxjGv4DckKuy/preview', // Replace 'your-file-id-8' with actual file ID
                definition: 'عبارة تُستخدم للترحيب بشخص.'
            },
            { 
                name: 'وَعَلَيْكُم السَّلَام', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1FHr-CjqoPLOLRG_5Nvlgvn8td6Vs2idF/preview', // Replace 'your-file-id-9' with actual file ID
                definition: 'رد على تحية السلام عليكم.'
            },
            { 
                name: 'عَفْوًا', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/119_kKMgxE_OQLl38GCBiRa524bGgZf3e/preview', // Replace 'your-file-id-10' with actual file ID
                definition: 'عبارة تُستخدم للتعبير عن الاعتذار.'
            },
            { 
                name: 'تعابير متداولة', 
                type: 'drive_link',
                link: 'https://drive.google.com/file/d/1XIkBQm7nUq1wz8PxP5ptU83_PcazfPzn/preview', // Replace 'your-file-id-11' with actual file ID
                definition: 'مجموعة من التعابير المتداولة في اللغة العربية.'
            },
        ]
    },
    
      {
        name: 'حروف أبجدية العربية',
        videos: [
          { 
            name: 'أ', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/EXAMPLE_ID_1/preview', 
            definition: 'الحرف الأول من الأبجدية العربية.'
          },
          { 
            name: 'ب', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/EXAMPLE_ID_2/preview', 
            definition: 'الحرف الثاني من الأبجدية العربية.'
          },
          // Add the rest of the Arabic alphabet videos here
        ]
      },
      {
        name: 'حروف أبجدية الفرنسية',
        videos: [
          { 
            name: 'A', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/A1/preview', 
            definition: 'الحرف الأول من الأبجدية الفرنسية.'
          },
          { 
            name: 'B', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/B1/preview', 
            definition: 'الحرف الثاني من الأبجدية الفرنسية.'
          },
          // Add the rest of the French alphabet videos here
        ]
      },
      {
        name: 'معجم الافعال المتداولة',
        videos: [
          { 
            name: 'Name 12', 
            type: 'drive_link',
            link: 'https://www.youtube.com/embed/VIDEO_ID_9', 
            definition: 'Description for Name 12.'
          },
          { 
            name: 'Name 13', 
            type: 'drive_link',
            link: 'https://www.youtube.com/embed/VIDEO_ID_10', 
            definition: 'Description for Name 13.'
          },
        ]
      },
      {
        name: 'معجم الإعلاميات',
        videos: [
          { 
            name: 'Name 14', 
            type: 'drive_link',
            link: 'https://www.youtube.com/embed/VIDEO_ID_11', 
            definition: 'Description for Name 14.'
          },
          { 
            name: 'Name 15', 
            type: 'drive_link',
            link: 'https://www.youtube.com/embed/VIDEO_ID_12', 
            definition: 'Description for Name 15.'
          },
        ]
      },
      {
        name: 'معجم الإداري',
        videos: [
          { 
            name: 'Admin Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/AdminID1/preview', 
            definition: 'First video in administrative domain.'
          },
          { 
            name: 'Admin Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/AdminID2/preview', 
            definition: 'Second video in administrative domain.'
          },
        ]
      },
     
      {
        name: 'معجم الرياضيات',
        videos: [
          { 
            name: 'Math Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/MathID1/preview', 
            definition: 'First video in mathematics domain.'
          },
          { 
            name: 'Math Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/MathID2/preview', 
            definition: 'Second video in mathematics domain.'
          },
        ]
      },
      {
        name: 'معجم التربية الإسلامية',
        videos: [
          { 
            name: 'Islamic Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/IslamicID1/preview', 
            definition: 'First video in Islamic education domain.'
          },
          { 
            name: 'Islamic Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/IslamicID2/preview', 
            definition: 'Second video in Islamic education domain.'
          },
        ]
      },
      {
        name: 'معجم التاريخ و الجغرافيا',
        videos: [
          { 
            name: 'Geography Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/GeoID1/preview', 
            definition: 'First video in road and geography domain.'
          },
          { 
            name: 'Geography Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/GeoID2/preview', 
            definition: 'Second video in road and geography domain.'
          },
        ]
      },
      {
        name: 'معجم الحياة المدرسية',
        videos: [
          { 
            name: 'School Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/SchoolID1/preview', 
            definition: 'First video in school life domain.'
          },
          { 
            name: 'School Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/SchoolID2/preview', 
            definition: 'Second video in school life domain.'
          },
        ]
      },
      {
        name: 'معجم الصفات المتداولة',
        videos: [
          { 
            name: 'Ethics Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/EthicsID1/preview', 
            definition: 'First video in ethics and virtue domain.'
          },
          { 
            name: 'Ethics Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/EthicsID2/preview', 
            definition: 'Second video in ethics and virtue domain.'
          },
        ]
      },
      {
        name: 'معجم طب و صحة',
        videos: [
          { 
            name: 'Medical Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/MedicalID1/preview', 
            definition: 'First video in medical and health domain.'
          },
          { 
            name: 'Medical Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/MedicalID2/preview', 
            definition: 'Second video in medical and health domain.'
          },
        ]
      },
      {
        name: 'معجم الطبخ و الحلويات',
        videos: [
          { 
            name: 'Cooking Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/CookingID1/preview', 
            definition: 'First video in cooking and desserts domain.'
          },
          { 
            name: 'Cooking Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/CookingID2/preview', 
            definition: 'Second video in cooking and desserts domain.'
          },
        ]
      },
      {
        name: 'معجم النحو و التركيب',
        videos: [
          { 
            name: 'Grammar Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/GrammarID1/preview', 
            definition: 'First video in grammar and syntax domain.'
          },
          { 
            name: 'Grammar Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/GrammarID2/preview', 
            definition: 'Second video in grammar and syntax domain.'
          },
        ]
      },
      {
        name: 'معجم العائلةٌ',
        videos: [
          { 
            name: 'Loanword Example 1', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/LoanwordID1/preview', 
            definition: 'First video in loanword domain.'
          },
          { 
            name: 'Loanword Example 2', 
            type: 'drive_link',
            link: 'https://drive.google.com/file/d/LoanwordID2/preview', 
            definition: 'Second video in loanword domain.'
          },
        ]
      },
    ];

    try {
      await Domain.insertMany(initialDomains);
      console.log('Initial data inserted');
    } catch (err) {
      console.error('Error inserting initial data', err);
    }
  } else {
    console.log('Data already exists in the database, skipping initial data insertion.');
  }
}


// API endpoint to get all domains
app.get('/api/domains', async (req, res) => {
  try {
    const domains = await Domain.find();
    res.json(domains);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Function to transform Google Drive link
function transformDriveLink(link) {
  const fileIdMatch = link.match(/\/d\/(.*?)\//);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  return link; // Return original link if it doesn't match the expected pattern
}

// API endpoint to create a new domain and add a video to it
app.post('/api/domains/create', upload.single('video'), async (req, res) => {
  try {
    const { name, definition, type, domainName } = req.body;

    const newDomain = new Domain({
      name: domainName,
      videos: []
    });

    let video = { name, definition, type };

    if (type === 'drive_link') {
      video.link = transformDriveLink(req.body.link);
    } else if (type === 'mp4' && req.file) {
      video.file = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).send('Invalid video type or missing file.');
    }

    newDomain.videos.push(video);
    const savedDomain = await newDomain.save();

    res.json(savedDomain);
  } catch (error) {
    res.status(500).send(error);
  }
});

// API endpoint to add a new video to an existing domain
app.post('/api/domains/:domainId/videos', upload.single('video'), async (req, res) => {
  try {
    const { name, definition, type, link } = req.body;
    const domainId = req.params.domainId;

    let video = { name, definition, type };

    if (type === 'drive_link') {
      video.link = transformDriveLink(link);
    } else if (type === 'mp4' && req.file) {
      video.file = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).send('Invalid video type or missing file.');
    }

    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res.status(404).send('Domain not found');
    }

    domain.videos.push(video);
    await domain.save();

    res.json(domain);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
