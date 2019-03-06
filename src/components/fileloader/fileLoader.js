var FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;
var PROXY_URL = process.env.PROXY_URL;
var bucketKey = FORGE_CLIENT_ID.toLowerCase() + '_tutorial_bucket';
var Buffer = require('buffer').Buffer;
var reader = new FileReader();

String.prototype.toBase64 = function () {
    // Buffer is part of Node.js to enable interaction with octet streams in TCP streams, 
    // file system operations, and other contexts.
    return new Buffer(this).toString('base64');
};

export default {
    name: "FileLoader",
    props: ["token"],
    data() {
        return {
            file: null,
            urn : ""
        }
    },
    methods: {
        loadFile() {
            if (this.file != null) {
                reader.onload = this.onFileRead
                reader.readAsBinaryString(this.file);
            }
        },
        onFileRead() {
            var headers = new Headers();
            headers.append("Authorization", "Bearer " + this.token);
            headers.append("Content-Disposition", this.file.name);
            headers.append("Content-Length", reader.result.length);
            fetch(PROXY_URL + "/oss/v2/buckets/" + encodeURIComponent(bucketKey) + "/objects/" + encodeURIComponent(this.file.name), {
                method: "PUT",
                headers: headers,
                body: reader.result
            })
            .then(response => response.json())
            .then(response => {
                var urn = response.objectId.toBase64();
                var format_type = 'svf';
                var format_views = ['2d', '3d'];
                var head = new Headers();
                head.append("Content-Type", "application/json");
                head.append("Authorization", "Bearer " + this.token);

                var toSend = JSON.stringify({
                    'input': {
                        'urn': urn
                    },
                    'output': {
                        'formats': [
                            {
                                'type': format_type,
                                'views': format_views
                            }
                        ]
                    }
                });
                fetch(PROXY_URL + "/modelderivative/v2/designdata/job", {
                    method: "POST",
                    headers: head,
                    body: toSend
                })
                .then(response => {
                    this.urn = urn;
                    this.$emit("urnUpdated", this.urn);
                })
                .catch(error => {
                    console.log(error);
                })
            })
            .catch(error => {
                console.log(error);
            })
        },
        clicked() {
            this.loadFile();
        }
    }
}