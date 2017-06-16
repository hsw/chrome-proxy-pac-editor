"use strict";

var app = {
    defaultConfig: "function FindProxyForURL(url, host) {\n  return 'DIRECT';\n}\n",
    nodeStatus: document.getElementById("status"),
    nodePac: document.getElementById("pac"),
    nodeError: document.getElementById("error"),

    loadConfig: function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            chrome.proxy.settings.get({}, function (details) {
                _this.nodeStatus.textContent = details.levelOfControl + " : " + details.value.mode;
                resolve(details.value.pacScript && details.value.pacScript.data);
            });
        });
    },
    setConfig: function (pac) {
        this.errorDump(null);
        return new Promise(function (resolve, reject) {
            if (pac) {
                chrome.proxy.settings.set({
                    value: {
                        mode: "pac_script",
                        pacScript: {
                            data: pac
                        }
                    }
                }, resolve);
            } else {
                chrome.proxy.settings.clear({}, resolve);
            }
        });
    },
    errorDump: function (error) {
        if (error) {
            this.nodeError.textContent = JSON.stringify(error, null, 2);
            this.nodeError.style.display = 'block';
        } else {
            this.nodeError.textContent = '';
            this.nodeError.style.display = 'none';
        }
    },

    doSet: function () {
        this.setConfig(this.nodePac.value).then(this.loadConfig.bind(this));
    },
    doUnset: function () {
        this.setConfig(null).then(this.loadConfig.bind(this));
    },
    doLoad: function () {
        var _this = this;
        this.loadConfig().then(function(pac) { _this.nodePac.value = pac || ''; })
    },
    doReset: function () {
        this.nodePac.value = this.defaultConfig;
    },
    init: function () {
        document.getElementById("btn-save").addEventListener("click", this.doSet.bind(this));
        document.getElementById("btn-disable").addEventListener("click", this.doUnset.bind(this));
        document.getElementById("btn-load").addEventListener("click", this.doLoad.bind(this));
        document.getElementById("btn-reset").addEventListener("click", this.doReset.bind(this));
        chrome.proxy.onProxyError.addListener(this.errorDump.bind(this));
        this.doLoad();
    }
};

app.init();