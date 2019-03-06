import { authenticate } from "../../apifunctions"

var viewerApp;

export default {
    name: "Viewer",
    props: ["isLoaded", "urn"],
    data() {
        return {
            options : {
                env: 'AutodeskProduction',
                api: 'derivativeV2', // TODO: for models uploaded to EMEA change this option to 'derivativeV2_EU'
                getAccessToken: this.getForgeToken
            },
        }
    },
    methods: {
        getUrlUrn(name) {
            name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        },
        onDocumentLoadSuccess(doc) {
            // We could still make use of Document.getSubItemsWithProperties()
            // However, when using a ViewingApplication, we have access to the **bubble** attribute,
            // which references the root node of a graph that wraps each object from the Manifest JSON.
            var viewables = viewerApp.bubble.search({'type':'geometry'});
            console.log("onDocumentLoadSuccess");
            if (viewables.length === 0) {
                console.error('Document contains no viewables.');
                return;
            }
            // Choose any of the avialble viewables
            viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
        },
        onDocumentLoadFailure(viewerErrorCode) {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
        },
        loadViewer() {
            Autodesk.Viewing.Initializer(this.$data.options, function onInitialized(){
                viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
                viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
                viewerApp.loadDocument(this.documentId(), this.onDocumentLoadSuccess, this.onDocumentLoadFailure);
            });
        },
        documentId() { 
            return "urn:" + getUrlUrn(this.urn);
        },
        getForgeToken(callback) {
            authenticate()
            .then(response => response.json())
            .then(response => {
                callback(response.access_token, response.expires_in);
            })
        }
    },
    watch: {
        urn: function(newVal, oldVal) {
            console.log("Urn received");
            console.log("Loading 3D Viewer");
            this.loadViewer();
        }
    }
}