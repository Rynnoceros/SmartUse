const urlInfluDb = "http://localhost:3000/d/OPwpXbCiz/dasboard-test?orgId=1&from=1420142526499&to=1552097509930&var-id=";

export default {
    name : "Stats",
    props: ["item"],
    data() {
        return {
            source: urlInfluDb
        }
    },
    watch: {
        item: function(newVal, oldVal) {
            console.log("item changed");
            this.source = urlInfluDb + this.item;
        }
    }
}