var FORGE_CLIENT_ID = FORGE_CLIENT_ID;
var FORGE_CLIENT_SECRET = FORGE_CLIENT_SECRET;
var scopes = 'data:read data:write data:create bucket:create bucket:read';
var access_token = '';
// Buckey key and Policy Key for OSS
const bucketKey = FORGE_CLIENT_ID.toLowerCase() + '_tutorial_bucket'; // Prefix with your ID so the bucket key is unique across all buckets on all other accounts
const policyKey = 'transient'; // Expires in 24hr

export default {
    name: 'app',
    data () {
        return {
            msg: 'Welcome to Your Vue.js App'
        }
    },
    created() {
        var headers = new Headers();
        var searchParams = new URLSearchParams();
        searchParams.set('client_id', FORGE_CLIENT_ID);
        searchParams.set('client_secret', FORGE_CLIENT_SECRET);
        searchParams.set('grant_type', 'client_credentials');
        searchParams.set('scope', scopes);
        headers.append("Content-Type", "application/x-www-form-urlencoded")
        fetch ("https://developer.api.autodesk.com/authentication/v1/authenticate", {
            method: "POST",
            headers: headers,
            body: searchParams
        })
        .then(response => response.json())
        .then(response => {
            // Success
            access_token = response.access_token;
            console.log(access_token);
            var head = new Headers();
            head.append("Content-Type", "application/json");
            head.append("Authorization", 'Bearer ' + access_token);
            fetch ("https://developer.api.autodesk.com/oss/v2/buckets", {
                method: "POST",
                headers: head,
                body: JSON.stringify({
                    "bucketKey": bucketKey,
                    "policyKey": policyKey  
                })
            })
            .then(response => {
                fetch("https://developer.api.autodesk.com/oss/v2/buckets/" + encodeURIComponent(bucketKey) + "/details", {
                    headers: head
                })
                .then(response => {
                    console.log("logged sucessfully");
                })
                .catch(error => {
                    // Failed
                    console.log(error);
                    //res.send('Failed to verify the new bucket');
                });
            })
            .catch(error => {
                if (error.response && error.response.status == 409) {
                    console.log('Bucket already exists, skip creation.');
                }
                // Failed
                console.log(error);
            });
        })
        .catch(error => {
            // Failed
            console.log(error);
        });
    }
}