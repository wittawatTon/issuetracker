const Issue = require('../models/Issue'); // Adjust path as needed

exports.createIssue = async ({ project, issue_title, issue_text, created_by, assigned_to, status_text }) => {
  try {
    const newIssue = new Issue({
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text
    });
    return await newIssue.save();
  } catch (err) {
    throw err;
  }
};

exports.getIssues = async ({ project, _id, created_by, assigned_to, open, issue_title, issue_text, status_text }) => {
  try {
    const filter = { project }; // Ensure filter includes project

    if (_id) filter._id = _id;
    if (created_by) filter.created_by = created_by;
    if (assigned_to) filter.assigned_to = assigned_to;
    if (open!=undefined) filter.open = open;
    if (issue_title) filter.issue_title = issue_title;
    if (issue_text) filter.issue_text = issue_text;
    if (status_text) filter.status_text = status_text;
    console.log("filter: " + JSON.stringify(filter) );
    return await Issue.find(filter);
  } catch (err) {
    throw err;
  }
};

exports.updateIssue = async (id, updateData) => {
  try {
    return await Issue.findByIdAndUpdate(id, updateData, { new: true });
  } catch (err) {
    throw err;
  }
};

exports.deleteIssue = async (id) => {
  try {
    return await Issue.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
};
