(function(){

    /** @param {string} str */
    function getWeekdayDifference(str) {
        const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const today = new Date().getDay();
        const targetDay = WEEKDAYS.indexOf(str);
        if (targetDay < 0) throw new Error('unable to find correct weekday for '+str);
        let difference = today-targetDay;
        while (difference < 0) difference += 7;
        while (difference > 6) difference -= 7;
        return difference;
    }

    /** @param {number} num */
    function zeroPad(num) {
        return (num < 10 ? '0' : '')+num;
    }

    /** @param {string} str */
    function parseJiraDate(str) {
        /** @type Date */
        let date = null;
        if (str.indexOf('/') !== -1) 
            date = new Date(str);
        else {
            const [relativeDay, time, ampm] = str.split(' ');
            const [hours, minutes] = time.split(':');

            date = new Date();

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

    /** @type HTMLTableElement */
    const userTable = document.querySelector('#user_browser_table');
    
    for (let i=0; i<userTable.rows.length; i++) {
        const row = userTable.rows.item(i);
        if (row.querySelector('th')) continue; // skip header rows
        const fullname = row.querySelector('[data-cell-type="fullname"]').textContent.trim();
        const username = row.dataset.user;

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

        buffer += `${fullname}\t${username}\t${lastLogin}\n`;
    }

    copy(buffer);
    window.alert('data placed to clipboard')
})()
