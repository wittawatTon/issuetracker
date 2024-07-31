const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('GET /api/issues/{project}', function() {
    let url = '/api/issues/get_issues_test_' + Date.now().toString().substring(7);

    suiteSetup(async () => {
      // Create issues for testing
      const issues = [
        { issue_title: 'Issue 1', issue_text: 'First issue', created_by: 'Alice', assigned_to: 'Bob', status_text: 'In Progress' },
        { issue_title: 'Issue 2', issue_text: 'Second issue', created_by: 'Alice', assigned_to: 'Bob', status_text: 'Open' },
        { issue_title: 'Issue 3', issue_text: 'Third issue', created_by: 'Alice', assigned_to: 'Eric', status_text: 'Open' },
        { issue_title: 'Issue 4', issue_text: 'Fourth issue', created_by: 'Carol', assigned_to: 'Eric', status_text: 'Open' }
      ];

      for (const issue of issues) {
        await chai.request(server)
          .post(url)
          .send(issue);
      }
    });

    test('Filter data setup', function(done) {
      chai.request(server)
        .get(url)
        .end((err, res) => {
          if (err) return done(err);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 4);
          done();
        });
    });

    test('Filter by created_by', function(done) {
      chai.request(server)
        .get(url + '?created_by=Alice')
        .end((err, res) => {
          if (err) return done(err);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 3);
          done();
        });
    });

    test('Filter by created_by and assigned_to', function(done) {
      chai.request(server)
        .get(url + '?created_by=Alice&assigned_to=Bob')
        .end((err, res) => {
          if (err) return done(err);
          assert.isArray(res.body);
          assert.lengthOf(res.body, 2);
          done();
        });
    });

    test('Filter by _id', function(done) {
      chai.request(server)
        .get(url + '?created_by=Alice&assigned_to=Bob')
        .end((err, res) => {
          if (err) return done(err);
          const copyId = res.body[0]._id;
          chai.request(server)
            .get(url + `?_id=${copyId}`)
            .end((err, res) => {
              if (err) return done(err);
              assert.isArray(res.body);
              assert.lengthOf(res.body, 1);
              assert.equal(res.body[0]._id, copyId, 'should be able to query a document by _id');
              done();
            });
        });
    });

  });

  suite('Functional Tests - DELETE /api/issues/:project', () => {
    let createdIssueId;
    let url = '/api/issues/get_issues_test_' + Date.now().toString().substring(7);

    suiteSetup(async () => {
      // Create an issue to be deleted later
      const issueData = {
        issue_title: 'Issue to be Deleted',
        issue_text: 'Functional Test - Delete target',
        created_by: 'fCC'
      };
      const res = await chai.request(server)
        .post(url)
        .send(issueData);

      createdIssueId = res.body._id;
      assert.isString(createdIssueId);
    });

    test('Delete an issue by valid ID', async () => {
      const res = await chai.request(server)
        .delete(url)
        .send({ _id: createdIssueId });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        result: 'successfully deleted',
        _id: createdIssueId
      });
    });

    test('Delete an issue without providing an ID', async () => {
      const res = await chai.request(server)
        .delete(url)
        .send();

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { error: 'missing _id' });
    });

    test('Delete an issue with an invalid ID', async () => {
      const res = await chai.request(server)
        .delete(url)
        .send({ _id: '5f665eb46e296f6b9b6a504d' });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        error: 'could not delete',
        _id: '5f665eb46e296f6b9b6a504d'
      });
    });
  });


  suite('Functional Tests - PUT /api/issues/:project', () => {
    let createdIssueId;
    let url = '/api/issues/get_issues_test_' + Date.now().toString().substring(7);

    suiteSetup(async () => {
      // Create an issue to be updated later
      const issueData = {
        issue_title: 'Issue to be Updated',
        issue_text: 'Functional Test - Update target',
        created_by: 'fCC'
      };
      const res = await chai.request(server)
        .post(url)
        .send(issueData);

      createdIssueId = res.body._id;
      assert.isString(createdIssueId);
    });

    test('Update an issue with no update fields', async () => {
      const res = await chai.request(server)
        .put(url)
        .send({ _id: createdIssueId });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        error: 'no update field(s) sent',
        _id: createdIssueId
      });
    });

    test('Update an issue with an invalid ID', async () => {
      const res = await chai.request(server)
        .put(url)
        .send({ _id: '5f665eb46e296f6b9b6a504d', issue_text: 'Updated Issue Text' });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        error: 'could not update',
        _id: '5f665eb46e296f6b9b6a504d'
      });
    });

    test('Update an issue with valid data', async () => {
      const res = await chai.request(server)
        .put(url)
        .send({ _id: createdIssueId, issue_text: 'Updated Issue Text' });

      assert.equal(res.status, 200);
      assert.isObject(res.body);
      assert.property(res.body, '_id');
      //assert.property(res.body, 'issue_text');
      //assert.equal(res.body.issue_text, 'Updated Issue Text');
    });


    test(' verify update time', async () => {

      const getUpdatedId = await chai.request(server)
        .get(url + '?_id=' + createdIssueId);

      assert.isArray(getUpdatedId.body);
      assert.isObject(getUpdatedId.body[0]);
      assert.property(getUpdatedId.body[0], 'issue_text');
      assert.equal(getUpdatedId.body[0].issue_text, 'Updated Issue Text');
      assert.isAbove(
        Date.parse(getUpdatedId.body[0].updated_on),
        Date.parse(getUpdatedId.body[0].created_on)
      );
    });
  });

  suite('Functional Tests - POST /api/issues/:project', function() {
    let url = '/api/issues/post_issues_test_' + Date.now().toString().substring(7);
  
    test('Test with required fields only', async function() {
      try {
        let issueData = {
          issue_title: 'Faux Issue Title',
          issue_text: 'Functional Test - Required Fields Only',
          created_by: 'fCC'
        };
        const res = await chai.request(server)
          .post(url)
          .send(issueData);
         
        assert.isObject(res.body);
        assert.nestedInclude(res.body, issueData);
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });
  
    test('Test with all fields filled in', async function() {
      try {
        let issueData = {
          issue_title: 'Faux Issue Title 2',
          issue_text: 'Functional Test - Every field filled in',
          created_by: 'fCC',
          assigned_to: 'Chai and Mocha'
        };
        const res = await chai.request(server)
          .post(url)
          .send(issueData);
         
        assert.isObject(res.body);
        assert.nestedInclude(res.body, issueData);
        assert.property(res.body, 'created_on');
        assert.isNumber(Date.parse(res.body.created_on));
        assert.property(res.body, 'updated_on');
        assert.isNumber(Date.parse(res.body.updated_on));
        assert.property(res.body, 'open');
        assert.isBoolean(res.body.open);
        assert.isTrue(res.body.open);
        assert.property(res.body, '_id');
        assert.isNotEmpty(res.body._id);
        assert.property(res.body, 'status_text');
        assert.isEmpty(res.body.status_text);
      } catch (err) {
        throw new Error(err.responseText || err.message);
      }
    });

    test('Test with required fields missing', async function() {
        try {
          let issueData = {
            issue_title: 'Faux Issue Title',

          };
          const res = await chai.request(server)
            .post(url)
            .send(issueData);
           
          assert.isObject(res.body);
          assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        } catch (err) {
          throw new Error(err.responseText || err.message);
        }
      });
    
  });
  
});
