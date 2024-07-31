const Issue = require('../models/Issue');
const IssueController = require('../controllers/IssueController');

module.exports = function(app) {

  app.route('/api/issues/:project')
    .get(async (req, res) => {
      try {
        const { project } = req.params;
        const { _id, created_by, assigned_to, open, issue_title, issue_text, status_text } = req.query;
        console.log("req.query" + JSON.stringify(req.query));
        console.log("create:" + created_by + " assigned:"+ assigned_to); 
        const issues = await IssueController.getIssues({
          project,
          _id,
          created_by,
          assigned_to,
          open,
          issue_title,
          issue_text,
          status_text
        });

        const response = {
           issues: issues.map(issue => ({
            _id: issue._id,
            issue_title: issue.issue_title,
            issue_text: issue.issue_text,
            created_on: issue.created_on,
            updated_on: issue.updated_on,
            created_by: issue.created_by,
            assigned_to: issue.assigned_to,
            open: issue.open,
            status_text: issue.status_text
          }))
        };
        const debug = {
          issues: issues.map(issue => ({
           _id: issue._id,
           created_by: issue.created_by,
           assigned_to: issue.assigned_to,
         }))
       };
        console.log("Return records:" + issues.length)
        console.log("Data:" + issues.map(issue => (
          String(issue._id) 
          + " project: " +  issue.project 
            + " createdBy: " +  issue.created_by 
            + " assignedTo: " +  issue.assigned_to
            + " created_on: " +  issue.created_on.toISOString()
           +"\n")));
        res.json(issues);
      } catch (err) {
        console.log("error get:" + err.message);
        res.status(500).json({ error: err.message });
      }
    })
    
    .post(async (req, res) => {
    
      try {
        const { project } = req.params;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
        console.log("post call:" +project);
        //console.log("post issue:"+issue_title+" is undefined:" + (issue_title===undefined));
        // Check for missing required fields
        if (!issue_title || !issue_text || !created_by || !project) {
          //console.log("return post required field missing 1:"+issue_title+" is undefined:" + (issue_title===undefined));
          return res.json({ error: 'required field(s) missing' });
        }
         
        const newIssue = await IssueController.createIssue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        });
        res.json(newIssue);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .put(async (req, res) => {
      try {
        const { project } = req.params;
        const { _id, ...updateData } = req.body;
        if (!_id) return res.status(200).json({  error: 'missing _id' } );
        if (Object.keys(updateData).length === 0) return res.status(200).json({  error: 'no update field(s) sent', '_id': _id } );
          // Check if the issue exists
          const issueExists = await Issue.findById(_id);
          if (!issueExists) {
            return res.status(200).json({ error: 'could not update', _id });
          }
          
          // update the issue if it exists
          const result = await IssueController.updateIssue(_id, updateData);
          if (!result) {
            return res.status(200).json({ error: 'could not update', _id });
          }
          console.log("result:" + result);
          console.log("result out :" + JSON.stringify({ result: 'successfully updated', _id }));
          //res.status(200).json({ result: 'successfully updated',  ...result.toObject() });
          res.status(200).json({ result: 'successfully updated',  _id });
        //res.json(updatedIssue);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .delete(async (req, res) => {
      try {
        const { project } = req.params;
        const { _id } = req.body;
        
        if (!_id) {
          return res.status(200).json({ error: 'missing _id' });
        }
        
        // Check if the issue exists
        const issueExists = await Issue.findById(_id);
        if (!issueExists) {
          return res.status(200).json({ error: 'could not delete', _id });
        }
        
        // Delete the issue if it exists
        const result = await Issue.findByIdAndDelete(_id);
        if (!result) {
          return res.status(200).json({ error: 'could not delete', _id });
        }
    
        res.status(200).json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    
};
