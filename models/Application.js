const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  programType: {
    type: String,
    enum: ['UPI', 'direct', 'scholarship'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'processing',
      'documents_pending',
      'interview_scheduled',
      'accepted',
      'rejected',
      'completed'
    ],
    default: 'draft'
  },
  probabilityScore: {
    type: String,
    enum: ['high', 'medium', 'low', 'pending'],
    default: 'pending'
  },
  probabilityPoints: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    enum: ['ads', 'agent', 'referral', 'organic', 'social_media', 'email', 'other'],
    required: true
  },
  sourceDetails: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    referralCode: String,
    adCampaign: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    nationality: String,
    currentCountry: String,
    state: String,
    city: String,
    address: String,
    gender: String,
    maritalStatus: String
  },
  academicBackground: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    graduationYear: Number,
    gpa: Number,
    gradingScale: {
      type: Number,
      default: 4.0
    },
    certificate: String
  }],
  targetInstitution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  targetCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  classificationResponses: [{
    questionId: String,
    question: String,
    answer: mongoose.Schema.Types.Mixed,
    category: String,
    weight: Number,
    score: Number
  }],
  documents: [{
    type: {
      type: String,
      enum: [
        'transcript',
        'passport',
        'cv',
        'sop',
        'recommendation',
        'ielts',
        'toefl',
        'pte',
        'degree_certificate',
        'birth_certificate',
        'medical_report',
        'bank_statement',
        'other'
      ]
    },
    name: String,
    url: String,
    cloudinaryId: String,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    visibility: {
      type: String,
      enum: ['admin', 'investor', 'university', 'all'],
      default: 'admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: String,
  paymentAmount: Number,
  submissionDate: Date
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ source: 1, createdAt: -1 });
applicationSchema.index({ probabilityScore: 1 });
applicationSchema.index({ programType: 1, status: 1 });

// Calculate probability before saving
applicationSchema.pre('save', function(next) {
  if (this.classificationResponses && this.classificationResponses.length > 0) {
    const totalScore = this.classificationResponses.reduce(
      (sum, resp) => sum + (resp.score || 0), 0
    );
    const maxScore = this.classificationResponses.reduce(
      (sum, resp) => sum + (resp.weight || 1) * 10, 0
    );
    const percentage = (totalScore / maxScore) * 100;
    
    this.probabilityPoints = totalScore;
    
    if (percentage >= 75) this.probabilityScore = 'high';
    else if (percentage >= 50) this.probabilityScore = 'medium';
    else this.probabilityScore = 'low';
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);