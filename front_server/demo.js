var tp = require('tedious-promises');
var Q = require('q');
var TYPES = require('tedious').TYPES;

//inits connection
tp.setConnectionConfig({
    userName: 'nyc_user',
    password: 'v@c4jairo',
    server: 'zw9rn5s0y6.database.windows.net',
    options: {encrypt: true, database: 'nycdb'}
});

/**
 * Increases in 1 the access of the camera Id camId (this ID is just a number)
 * @param  {Int} camId the camera ID (eg: 2, 104)
 * @return {Q.promise}       A promise that when fulfiled means that the data
 *                             was updated. The promise may be refused only if
 *                             there's a network issue or camId is invalid.
 */
function updateAccess_promise(camId) {
    return tp.sql("update cameras set accesses = accesses + 1 where id = @id")
    .parameter('id', TYPES.Int, camId)
    .execute();
}

/**
 * Get the maxRows most accessed cameras.
 * @param  {Int} maxRows The amount of most accessed cameras to be retrieved. Be
 *                       mindful that this parameter is hardoded inside the SQL
 *                       expression due to tedious-promises limitation. Still the
 *                       function checks if the ID is a positive integer (but not
 *                       if it is lesser than the upper bound).
 * @return {Q.promise}   A promise that when fulfiled contains an array of JSON
 *                         objects with the cam id and the amount of accesses
 *                         performed on it. This promise may be rejected either
 *                         due to network or SQL faults.
 */
function getTopCameras_promise(maxRows) {
    if (Number(maxRows) !== maxRows || maxRows < 0)
        Promise.reject(new Error("Invalid parameter maxRows."))
    else {
        //unfortunately tp doesn't allow to use tokens with top. This is unsafe, but since
        //only the programmer is using this method, it's kind of ok
        return tp.sql("select top "+maxRows+" id, accesses from cameras order by accesses desc")
        .execute()
    }

    return deferred.promise;
}

module.exports.updateAccess_promise = updateAccess_promise;
module.exports.getTopCameras_promise = getTopCameras_promise;

// updateAccess_promise("1").done();
// getTopCameras_promise(10).done(console.log);
