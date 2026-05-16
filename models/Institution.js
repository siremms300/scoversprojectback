const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['university', 'college', 'polytechnic', 'vocational', 'language_school', 'other'],
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: String,
  city: String,
  address: String,
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  logo: String,
  coverImage: String,
  images: [String],
  ranking: {
    global: Number,
    national: Number,
    regional: Number
  },
  accreditation: [{
    name: String,
    body: String,
    year: Number
  }],
  studentCount: Number,
  internationalStudentCount: Number,
  acceptanceRate: Number,
  foundedYear: Number,
  tuitionRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  applicationDeadlines: [{
    term: String,
    intake: String,
    deadline: Date,
    programType: String
  }],
  requirements: {
    minimumGpa: Number,
    englishProficiency: {
      ielts: Number,
      toefl: Number,
      pte: Number,
      duolingo: Number
    },
    standardizedTests: [{
      name: String,
      minimumScore: Number
    }]
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  facilities: [String],
  accommodation: {
    available: Boolean,
    types: [String],
    costRange: String
  },
  scholarships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  }],
  website: String,
  contactEmail: String,
  contactPhone: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  universityAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  partnerships: [{
    partner: String,
    type: String,
    description: String,
    since: Date
  }]
}, {
  timestamps: true
});

// Text index for search
institutionSchema.index({ name: 'text', description: 'text', country: 'text', city: 'text' });
institutionSchema.index({ country: 1, type: 1 });
institutionSchema.index({ featured: 1, status: 1 });

module.exports = mongoose.model('Institution', institutionSchema);