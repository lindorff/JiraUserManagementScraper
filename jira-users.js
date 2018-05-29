(function(){
    // if the script is run in Node, then we only run tests.
    if (typeof process !== 'undefined') require('./tests')(getWeekdayDifference,zeroPad,parseJiraDate);

    /** 
     * @param {string} target 
     * @param {number} today
     */
    function getWeekdayDifference(target, today = new Date().getDay()) {
        const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const targetDay = WEEKDAYS.indexOf(target);
        if (targetDay < 0) throw new Error('unable to find correct weekday for '+target);
        let difference = today-targetDay;
        while (difference < 0) difference += 7;
        while (difference > 6) difference -= 7;
        return difference;
    }

    /** @param {number} num */
    function zeroPad(num) {
        return (num < 10 ? '0' : '')+num;
    }

    /** 
     * @param {string} str string to parse
     * @param {Date} today date to use when comparing relative times
     */
    function parseJiraDate(str, today = new Date()) {
        let date = new Date(today);
        if (str.indexOf('/') !== -1) 
            date = new Date(str);
        else {
            const [relativeDay, time, ampm] = str.split(' ');
            const [hours, minutes] = time.split(':');

            switch (relativeDay.toLowerCase()) {
                case 'today': break; // day is already correct
                case 'yesterday': date.setDate(date.getDate()-1); break;
                default: date.setDate(date.getDate()-getWeekdayDifference(relativeDay.toLowerCase())); break;
            }

            let hoursNum = parseInt(hours);
            if (ampm.toLowerCase() === 'pm') {
                if (hours === '12') hoursNum = 12;
                else hoursNum = parseInt(hours)+12;
            }
            else if (ampm.toLowerCase() === 'am' && hours === "12") hoursNum = 0;

            date.setHours(hoursNum);
            date.setMinutes(parseInt(minutes));
            date.setSeconds(0);
            date.setMilliseconds(0);
        }

        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hours)}:${zeroPad(minutes)}`;
    }

    let buffer = '';
    const LAST_LOGIN_TOKEN = 'Last:';
    const LAST_FAILED_LOGIN_TOKEN = 'Last failed login:';
    const NEVER_LOGGED_IN_TOKEN = 'Never logged in';

    const interestingGroups = window.prompt('Which user groups do you want to recognize in the results (separate with comma)?').split(',');

    /** @type HTMLTableElement */
    const userTable = document.querySelector('#user_browser_table');
    
    for (let i=0; i<userTable.rows.length; i++) {
        const row = userTable.rows.item(i);
        if (row.querySelector('th')) continue; // skip header rows
        const fullname = row.querySelector('[data-cell-type="fullname"]').textContent.trim();
        const username = row.dataset.user;

        const groupsFullText = row.querySelector('[data-cell-type="user-groups"]').textContent.trim();
        const groupsFragments = interestingGroups.map(group => groupsFullText.indexOf(group) !== -1 ? group : '');
        const groupsBufferFragment = groupsFragments.join('\t');

        const loginDetailsFull = row.querySelector('[data-cell-type="login-details"]').textContent;
        const hasLoggedInIndex = loginDetailsFull.indexOf(LAST_LOGIN_TOKEN);
        const hasFailedLoginIndex = loginDetailsFull.indexOf(LAST_FAILED_LOGIN_TOKEN);
        const hasNeverLoggedInIndex = loginDetailsFull.indexOf(NEVER_LOGGED_IN_TOKEN);

        let lastLogin = '';
        if (hasNeverLoggedInIndex >= 0) {
            lastLogin = 'Never logged in';
        } else if (hasFailedLoginIndex >= 0) {
            const jiraDate = loginDetailsFull.substr(hasFailedLoginIndex+LAST_FAILED_LOGIN_TOKEN.length).split('\n')[0];
            lastLogin =  parseJiraDate(jiraDate) + " [last fail]";
        } else if (hasLoggedInIndex) {
            lastLogin = parseJiraDate(loginDetailsFull.substr(hasLoggedInIndex+LAST_LOGIN_TOKEN.length).trim());
        } else {
            throw new Error('Unrecognized login cell contents: '+loginDetailsFull);
        }

        buffer += `${fullname}\t${username}\t${lastLogin}\t${groupsBufferFragment}\n`;
    }

    copy(buffer);
    window.alert('data placed to clipboard')
})()
