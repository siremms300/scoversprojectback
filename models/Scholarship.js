const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
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
    enum: ['full', 'partial', 'tuition', 'research', 'need_based', 'merit_based'],
    required: true
  },
  provider: {
    name: String,
    type: {
      type: String,
      enum: ['institution', 'government', 'organization', 'individual', 'corporate']
    },
    logo: String
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  amount: {
    value: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    covers: [{
      type: String,
      enum: ['tuition', 'accommodation', 'living_expenses', 'travel', 'books', 'health_insurance', 'full']
    }]
  },
  description: String,
  eligibility: {
    nationality: [String],
    minimumGpa: Number,
    ageLimit: {
      min: Number,
      max: Number
    },
    level: [String],
    fields: [String],
    otherRequirements: [String]
  },
  benefits: [String],
  applicationProcess: [String],
  requiredDocuments: [String],
  deadline: Date,
  startDate: Date,
  duration: String,
  slots: Number,
  status: {
    type: String,
    enum: ['active', 'closed', 'upcoming', 'expired'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  contactEmail: String,
  website: String,
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    applicationDate: Date,
    status: String
  }]
}, {
  timestamps: true
});

scholarshipSchema.index({ deadline: 1, status: 1 });
scholarshipSchema.index({ type: 1, status: 1 });
scholarshipSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Scholarship', scholarshipSchema);