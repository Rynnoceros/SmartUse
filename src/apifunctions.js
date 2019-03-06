var FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;
var FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;
var PROXY_URL = process.env.PROXY_URL;
var scopes = 'data:read data:write data:create bucket:create bucket:read';
const bucketKey = FORGE_CLIENT_ID.toLowerCase() + '_tutorial_bucket'; // Prefix with your ID so the bucket key is unique across all buckets on all other accounts
const policyKey = 'transient'; // Expires in 24hr

export function authenticate() {
    var headers = new Headers();
    var searchParams = new URLSearchParams();
    searchParams.set('client_id', FORGE_CLIENT_ID);
    searchParams.set('client_secret', FORGE_CLIENT_SECRET);
    searchParams.set('grant_type', 'client_credentials');
    searchParams.set('scope', scopes);
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    
    return fetch (PROXY_URL + "/authentication/v1/authenticate", {
        method: "POST",
        headers: headers,
        body: searchParams
    });
}

export function createBucket(token) {
    var head = new Headers();
    head.append("Content-Type", "application/json");
    head.append("Authorization", 'Bearer ' + token);
    return fetch (PROXY_URL + "/oss/v2/buckets", {
        method: "POST",
        headers: head,
        body: JSON.stringify({
            "bucketKey": bucketKey,
            "policyKey": policyKey  
        })
    })
}

export function getBucketDetail(token) {
    var head = new Headers();
    head.append("Content-Type", "application/json");
    head.append("Authorization", 'Bearer ' + token);
    return fetch(PROXY_URL + "/oss/v2/buckets/" + encodeURIComponent(bucketKey) + "/details", {
        headers: head
    })
}