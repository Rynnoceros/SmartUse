import { setInterval } from "timers";

const urlInfluDb = "http://localhost:3000/d/XBeiMfCmk/temperature-evolution?orgId=1&refresh=5s";
const urlCurrentTemp = "http://localhost:3000/d/eb_As-jmk/current-temperature?orgId=1&refresh=5s";
const urlInfluxdbWrite = "http://localhost:8086/write?db=smart_use";

export default {
    name : "Stats",
    props: ["isLoaded", "item"],
    data() {
        return {
            source: urlInfluDb,
            currentTemp: urlCurrentTemp,
            loaded: false,
            interval: null
        }
    },
    methods: {
        createRandomData() {
            var data = "temperature,id="+this.item+" value="+Math.floor(Math.random() * 55)+" "+Math.floor(Date.now())+"000000";
            fetch(urlInfluxdbWrite, {
                method: "POST",
                body: data
            })
            .then(response => {
                console.log("Data sent:"+data);
            })
            .catch(error => {
                console.log("Error generating data:"+error);
            })
        },
    },
    watch: {
        item: function(newVal, oldVal) {
            console.log("item changed");
            this.source = urlInfluDb + "&var-id=" + this.item;
            this.currentTemp = urlCurrentTemp + "&var-id=" + this.item;
            if (this.interval != null) {
                clearInterval(this.interval);
                this.interval = null;
            }
            if (this.item != null) {
                if (this.interval == null) {
                    this.interval = setInterval(this.createRandomData.bind(this),5000);
                }
            }
        },
        isLoaded: function(newVal, oldVal) {
            this.loaded = this.isLoaded;
        }
    }
}