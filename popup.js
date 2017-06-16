"use strict";

var defaultConfig = "function FindProxyForURL(url, host) {\n  return 'DIRECT';\n}\n";

var app = new Vue({
    el: "#app",
    data: {
        levelOfControl: null,
        mode: null,
        pac: null,
        enabled: false,
        error: null
    },
    computed: {
        errorDump: function() {
            return this.error && JSON.stringify(this.error, null, true);
        }
    },
    methods: {
        loadConfig: function () {
            var _this = this;
            chrome.proxy.settings.get({}, function (details) {
                console.log("PROXY conf", details);
                _this.levelOfControl = details.levelOfControl;
                _this.mode = details.value.mode;
                _this.pac = details.value.pacScript && details.value.pacScript.data;
                _this.enabled = details.value.mode === "pac_script" && details.levelOfControl === "controlled_by_this_extension";
            });
        },
        setConfig: function () {
            var _this = this;
            this.error = null;

            if (this.enabled && this.pac) {
                console.info("Set config:", this.pac);

                chrome.proxy.settings.set(
                    {
                        value: {
                            mode: "pac_script",
                            pacScript: {
                                data: this.pac
                            }
                        }
                    },
                    function () {
                        _this.loadConfig();
                    });
            } else {
                console.info("Clear config");
                chrome.proxy.settings.clear(
                    {},
                    function () {
                        _this.loadConfig();
                    });
            }
        },
        doReset: function () {
            this.pac = defaultConfig;
            this.enabled = true;
            this.setConfig();
        },
        onEnabledChange: function () {
            this.setConfig();
        },
        onPacChange: function () {
            if (this.enabled) {
                this.setConfig();
            }
        },
        onError: function (details) {
            this.error = details;
        }
    },
    mounted: function () {
        chrome.proxy.onProxyError.addListener(this.onError);
        this.loadConfig();
    },
    beforeDestroy: function () {
        chrome.proxy.onProxyError.removeListener(this.onError);
    }
});