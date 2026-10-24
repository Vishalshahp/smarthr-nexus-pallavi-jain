const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern', 'consultant'],
      default: 'full_time',
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office',
    },
    shift: {
      type: { type: String, enum: ['morning', 'evening', 'night', 'flexible'], default: 'morning' },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
    },
    probationEndDate: { type: Date },
    confirmationDate: { type: Date },
    noticePeriod: { type: Number, default: 30 }, // days
    status: {
      type: String,
      enum: ['active', 'on_leave', 'probation', 'suspended', 'resigned', 'terminated'],
      default: 'active',
    },
    offboardingDate: { type: Date },
    offboardingReason: { type: String },
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
        grade: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        responsibilities: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
        expiryDate: Date,
        credentialId: String,
      },
    ],
    performanceRating: { type: Number, min: 0, max: 5, default: 0 },
    leaveBalance: {
      annual: { type: Number, default: 18 },   // Earned Leave (EL)
      sick: { type: Number, default: 8 },      // Sick Leave (SL)
      casual: { type: Number, default: 8 },    // Casual Leave (CL)
      maternity: { type: Number, default: 182 }, // 26 weeks
      paternity: { type: Number, default: 10 },
      unpaid: { type: Number, default: 0 },
    },
    payrollDetails: {
      ctc: { type: Number, default: 0 },
      inHandSalary: { type: Number, default: 0 },
      pfNumber: String,
      uanNumber: String,
      esiNumber: String,
      panNumber: String,
      taxRegime: { type: String, enum: ['old', 'new'], default: 'new' },
    },
    assets: [
      {
        assetType: String,
        assetId: String,
        assignedDate: Date,
        returnDate: Date,
        condition: String,
      },
    ],
    onboardingChecklist: [
      {
        task: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    goals: [
      {
        title: String,
        description: String,
        targetDate: Date,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        progress: { type: Number, min: 0, max: 100, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeSchema.index({ status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
