const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  level: {
    type: String,
    enum: [
      'certificate',
      'diploma',
      'associate',
      'bachelors',
      'masters',
      'phd',
      'postdoctoral',
      'professional'
    ],
    required: true
  },
  field: {
    type: String,
    required: true
  },
  subField: String,
  duration: {
    years: Number,
    months: Number,
    fullTerm: String
  },
  mode: {
    type: String,
    enum: ['full_time', 'part_time', 'online', 'hybrid', 'distance'],
    required: true
  },
  tuition: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    per: {
      type: String,
      enum: ['year', 'semester', 'term', 'credit', 'total'],
      default: 'year'
    }
  },
  description: String,
  curriculum: [{
    year: Number,
    semester: Number,
    courses: [{
      name: String,
      code: String,
      credits: Number,
      description: String
    }]
  }],
  requirements: {
    academic: [String],
    english: {
      ielts: Number,
      toefl: Number,
      pte: Number
    },
    documents: [String],
    interview: Boolean
  },
  credits: Number,
  accreditation: [String],
  careerProspects: [String],
  intakeMonths: [String],
  applicationDeadline: Date,
  startDate: Date,
  capacity: Number,
  currentStudents: Number,
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

courseSchema.index({ institution: 1, level: 1 });
courseSchema.index({ field: 1, status: 1 });
courseSchema.index({ name: 'text', description: 'text', field: 'text' });

module.exports = mongoose.model('Course', courseSchema);