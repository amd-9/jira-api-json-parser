const path = require('node:path');
const fs = require('node:fs');

const jiraInstanceUri = "https://jira.local";
const project = "MyProject";

const pathToJsonFile = path.resolve('./examples/jiraStoriesJqlResponseExample.json');
const pathToDevelopersTaskJsonFile = path.resolve('./examples/jiraDeveloperTasksJqlResponseExample.json');

const jiraApiRespose = fs.readFileSync(pathToJsonFile);
const jiraDeveloperTaskJqlApiResponse = fs.readFileSync(pathToDevelopersTaskJsonFile);

const { issues: stories } = JSON.parse(jiraApiRespose);
const { issues: developerTasks} = JSON.parse(jiraDeveloperTaskJqlApiResponse);

const developerTaskKeys = stories
.reduce((acc, issue ) => {
    const inwardDeveloperIssues = issue.fields.issuelinks
        .filter(link => link.type.inward === "Parent Of" && link.inwardIssue)
        .map(link => link.inwardIssue.key);

    return [ ...acc,  ...inwardDeveloperIssues]
}, [])

console.log('Booting up parser!');
console.log(developerTaskKeys);

const developerTasksJql = `project = ${project} AND key in ("${developerTaskKeys.join("\",\"")}")`;
const filedsToQuery = ['timetracking','status','worklog'];
const developerTasksJqlApiUri = `${jiraInstanceUri}/rest/api/2/search?jql=${developerTasksJql}&fields=${filedsToQuery.join(',')}`;

console.log(developerTasksJqlApiUri);

const workRecords = developerTasks.map(({key, fields}) => ({key, timetracking: fields.timetracking}));

console.log(workRecords);

