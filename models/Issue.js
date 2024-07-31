const mongoose = require('mongoose');

// Define the Issue Schema
const issueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: {
    type: String,
    default: ''
  },
  open: {
    type: Boolean,
    default: true
  },
  status_text: {
    type: String,
    default: ''
  },
  project: {
    type: String, 
    required: true
  }
});

// Middleware to update `updated_on` before saving
issueSchema.pre('save', function(next) {
  console.log("-------------Update_on middleware-----------")
  this.updated_on = Date.now();
  next();
});

// Create and export the Issue model
const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
