const __UNIQUE_API_ID = "dc657b32097507ca7d98442fa52d2d85";

/**
 * >EXTREMELY< simple authentication, since there's just one user for this API.
 * Still, makes DDOS more difficult ;)
 * @param  {string} id The received API ID.
 * @return {boolean}   True if this is a valid API ID.
 */
function isValid(id) {
    return id == __UNIQUE_API_ID;
}

module.exports.isValid = isValid;
