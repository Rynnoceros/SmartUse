import Viewer from "./components/viewer/Viewer.vue"
import FileLoader from "./components/fileloader/FileLoader.vue"
import Stats from "./components/stats/Stats.vue"
import { authenticate, createBucket, getBucketDetail } from "./apifunctions"

export default {
    name: 'app',
    components: {
        "viewer" : Viewer,
        "file-loader" : FileLoader,
        "stats" : Stats
    },
    data () {
        return {
            isLoaded: false,
            token: '',
            urn: ''
        }
    },
    created() {
        this.connect();
    },
    methods: {
        connect() {
            authenticate()
            .then(response => response.json())
            .then(response => {
                // Success
                this.token = response.access_token;
                console.log(this.token);
                createBucket(this.token)
                .then(response => {
                    getBucketDetail(this.token)
                    .then(response => {
                        this.isLoaded = true;
                        console.log("logged sucessfully");
                    })
                    .catch(error => {
                        // Failed
                        console.log(error);
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
        },
        updateUrn(urn) {
            this.urn = urn;
        }
    },
}