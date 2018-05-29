function assertEqualStrong(actual, expected, message = null) {
    if (actual !== expected) {
        if (message === null) message = `${actual} should've been ${expected}`;
        throw new Error(message);
    }
}

/**
 * @param {function} getWeekdayDifference 
 * @param {function} zeroPad 
 * @param {function} parseJiraDate 
 */
function tests(getWeekdayDifference,zeroPad,parseJiraDate) {
    // self test
    assertEqualStrong(true, true, "true should've equaled true");
    assertEqualStrong('foo', 'foo', "two strings should equal each other");
    try {
        assertEqualStrong(1, true, "true should've equaled true");
        throw new Error('1 should not equal true');
    } catch (e) {
        // pass
    }

    // zero pad
    assertEqualStrong(zeroPad( 1), '01');
    assertEqualStrong(zeroPad( 9), '09');
    assertEqualStrong(zeroPad(10), '10');
    assertEqualStrong(zeroPad(11), '11');

    // parseJiraDate, definite dates
    assertEqualStrong(parseJiraDate("01/Feb/18 5:00 AM"),  "2018-02-01 05:00");
    assertEqualStrong(parseJiraDate("02/Jan/18 5:00 AM"),  "2018-01-02 05:00");
    assertEqualStrong(parseJiraDate("01/Jan/18 12:00 AM"), "2018-01-01 00:00", "12AM should be midnight");
    assertEqualStrong(parseJiraDate("01/Jan/18 12:00 PM"), "2018-01-01 12:00", "12PM should be noon");

    // parseJiraDate, relative dates
    assertEqualStrong(parseJiraDate("Today 1:00 PM", new Date('2018-01-01')), "2018-01-01 13:00", "'Today' not working properly");
    assertEqualStrong(parseJiraDate("Yesterday 1:00 PM", new Date('2018-01-02')), "2018-01-01 13:00", "'Yesterday' not working properly");
    
    // getWeekdayDifference
    const MONDAY = 1;
    assertEqualStrong(getWeekdayDifference('monday', MONDAY), 0);
    assertEqualStrong(getWeekdayDifference('sunday', MONDAY), 1);
    assertEqualStrong(getWeekdayDifference('tuesday', MONDAY), 6);

    console.log('All tests pass');
    process.exit(0);
}

module.exports = tests;
