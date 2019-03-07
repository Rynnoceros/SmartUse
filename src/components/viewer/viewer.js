import { authenticate } from "../../apifunctions"

var viewerApp;

export default {
    name: "Viewer",
    props: ["isLoaded", "urn"],
    data() {
        return {
            options : {
                env: 'AutodeskProduction',
                api: 'derivativeV2',
                getAccessToken: this.getForgeToken
            },
            viewables: null,
            selectedItem: null
        }
    },
    methods: {
        onDocumentLoadSuccess(doc) {
            // We could still make use of Document.getSubItemsWithProperties()
            // However, when using a ViewingApplication, we have access to the **bubble** attribute,
            // which references the root node of a graph that wraps each object from the Manifest JSON.
            this.viewables = viewerApp.bubble.search({'type':'geometry'});
            console.log("onDocumentLoadSuccess");
            if (this.viewables.length === 0) {
                console.error('Document contains no viewables.');
                return;
            }
            // Choose any of the avialble viewables
            if (viewerApp != null) {
                viewerApp.selectItem(this.viewables[0].data, this.onItemLoadSuccess.bind(this), this.onItemLoadFail.bind(this));
            }
        },
        onItemLoadSuccess(viewer, item) {
            console.log('onItemLoadSuccess()!');
            console.log(viewer);
            console.log(item);
            // Congratulations! The viewer is now ready to be used.
            console.log('Viewers are equal: ' + (viewer === viewerApp.getCurrentViewer()));
        },
        onItemLoadFail(viewerErrorCode) {
            console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
            //jQuery('#MyViewerDiv').html('<p>There is an error fetching the translated SVF file. Please try refreshing the page.</p>');
        },
        onDocumentLoadFailure(viewerErrorCode) {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
        },
        loadViewer() {
            Autodesk.Viewing.Initializer(this.$data.options, function onInitialized(){
                console.log("Initializing viewer");
                if (viewerApp == null) {
                    viewerApp = new Autodesk.Viewing.ViewingApplication('MyViewerDiv');
                    viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
                }
                console.log("Viewer initialized");
            });
        },
        loadDocument(documentToLoad) {
            if (viewerApp != null) {
                viewerApp.loadDocument(documentToLoad,this.onDocumentLoadSuccess.bind(this),
                                       this.onDocumentLoadFailure.bind(this));
            }
        },
        documentId() { 
            console.log("documentId return : urn:" + this.urn);
            return "urn:" + this.urn;
        },
        getForgeToken(callback) {
            authenticate()
            .then(response => response.json())
            .then(response => {
                console.log("getForgeToken callback :" + response.access_token + " " + response.expires_in);
                callback(response.access_token, response.expires_in);
            })
        },
        clicked() {
            if (viewerApp != null) {
                var item = viewerApp.getCurrentViewer().getSelection();
                if (item != this.selectedItem) {
                    this.selectedItem = item;
                    this.onSelectedItemChanged();
                    this.$emit("itemSelectedChanged", this.selectedItem);
                }
            }
        },
        onSelectedItemChanged() {
            console.log("Selection changed : " + this.selectedItem);
        },
    },
    watch: {
        urn: function(newVal, oldVal) {
            console.log("Urn received");
            console.log("Loading 3D Viewer");
            this.loadDocument(this.documentId());
        },
        isLoaded: function(newVal, oldVal) {
            this.loadViewer();
        }
    }
}