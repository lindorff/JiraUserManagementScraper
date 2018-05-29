# Jira User Scraper

This code snippet is used to parse the contents of Jira's User management page.

Open your brower to https://YOUR.JIRA.SERVER.HERE/secure/admin/user/UserBrowser.jspa and open the developer console (e.g. F12 on Windows + Chrome), copy the contents of `jira-users.js` and paste it in the console. You'll get the results in your clipboard. Then paste the results in e.g. Excel.

You'll get a prompt where you can specify which user groups you explicitly want to be shown in the report.

_Has only been tested to work on Chrome_

## Testing

To run the tests, just run `node jira-users.js` and the tests from `tests.js` will be run appropriately.
