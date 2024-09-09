const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/videoDatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const Domain = mongoose.model('Domain', {
  name: String,
  videos: [
    {
      name: String,
      link: String,
      definition: String,
    },
  ],
});

const domains = [
  {
    name: 'تعابير متداولة',
    videos: [
      {
        name: 'بِاسْمِ الله',
        link: 'https://drive.google.com/file/d/1916oVQ5-Vhjy0Y2-N8TlJKcrurk_4nck/preview',
        definition: 'عبارة تُستخدم لبدء شيء ما.',
      },
      // Add more videos here
    ],
  },
  // Add more domains here
];

Domain.insertMany(domains, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Data inserted');
  }
  mongoose.connection.close();
});
