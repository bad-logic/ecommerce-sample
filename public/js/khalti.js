var KhaltiCheckout = function() {
    "use strict";

    function t(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    var e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        },
        n = function(t, e) {
            return e = {
                exports: {}
            }, t(e, e.exports), e.exports
        }(function(t, n) {
            Object.defineProperty(n, "__esModule", {
                value: !0
            });
            var i = "function" == typeof Symbol && "symbol" === e(Symbol.iterator) ? function(t) {
                    return void 0 === t ? "undefined" : e(t)
                } : function(t) {
                    return t && "function" == typeof Symbol && t.constructor === Symbol ? "symbol" : void 0 === t ? "undefined" : e(t)
                },
                r = n.SkipValidation = function(t) {
                    this.name = "SkipValidation", this.message = t
                },
                o = n.validateSingle = function(t, e, n, i, o) {
                    var a = [];
                    "function" == typeof e && (e = [e]);
                    for (var u = 0; u < e.length; u++) try {
                        var l = e[u](t, i);
                        "string" == typeof l && a.push(l.replace("{value}", t).replace("{key}", o))
                    } catch (t) {
                        if (t instanceof r) break
                    }
                    return !0 === n ? a : a.length > 0 ? a[0] : void 0
                };
            n.validate = function(t, e, n) {
                if (e) {
                    var r = {},
                        a = !0;
                    if ("object" === (void 0 === e ? "undefined" : i(e)) && !e.length) {
                        for (var u in e)
                            if (e.hasOwnProperty(u)) {
                                var l = o(t[u], e[u], n, t, u);
                                void 0 !== l && (a = !1), r[u] = l
                            }
                        return a ? void 0 : r
                    }
                    return r = o(t, e, n)
                }
            }, n.required = function(t, e) {
                function n(t) {
                    return void 0 === t || "" === t || null === t
                }
                return function(i) {
                    if (t && n(i)) return e || "This field is required.";
                    if (!t && n(i)) throw new r
                }
            }, n.isNumber = function(t) {
                return function(e) {
                    if ("number" != typeof e || isNaN(e)) return t || "'{value}' is not a valid number."
                }
            }, n.isString = function(t) {
                return function(e) {
                    if ("string" != typeof e) return t || "'{value}' is not a valid string."
                }
            }, n.isFunction = function(t) {
                return function(e) {
                    if ("function" != typeof e) return t || "Expected a function."
                }
            }, n.isObject = function(t) {
                return function(e) {
                    if (e !== Object(e)) return t || "Expected an object."
                }
            }, n.isArray = function(t) {
                return function(e) {
                    if ("[object Array]" !== Object.prototype.toString.call(e)) return t || "Expected an array."
                }
            }, n.length = function(t, e) {
                return function(n) {
                    if ((n + "").length !== t) return e || "It must be " + t + " characters long."
                }
            }, n.isEmail = function(t) {
                return function(e) {
                    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e)) return t || "Invalid email id."
                }
            }, n.equalsTo = function(t, e) {
                return function(n, i) {
                    if (n !== i[t]) return e || "'{key}' and '" + t + "' do not match."
                }
            }, n.minLength = function(t, e) {
                return function(n) {
                    if ((n + "").length < t) return e || "It must be at least " + t + " characters long."
                }
            }, n.maxLength = function(t, e) {
                return function(n) {
                    if ((n + "").length > t) return e || "It must be at most " + t + " characters long."
                }
            }, n.isBoolean = function(t) {
                return function(e) {
                    if (!0 !== e && !1 !== e) return t || "Invalid boolean value."
                }
            }, n.within = function(t, e) {
                return function(n) {
                    n instanceof Array || (n = [n]);
                    for (var i = [], r = 0; r < n.length; r++) - 1 === t.indexOf(n[r]) && i.push(n[r]);
                    if (i.length > 0) return e || "[" + i + "] do not fall under the allowed list."
                }
            }, n.excludes = function(t, e) {
                return function(n) {
                    n instanceof Array || (n = [n]);
                    for (var i = [], r = 0; r < n.length; r++) - 1 !== t.indexOf(n[r]) && i.push(n[r]);
                    if (i.length > 0) return e || "[" + i + "] fall under restricted values."
                }
            }, n.pattern = function(t, e) {
                return function(n) {
                    if (!t.test(n)) return e || "'{value}' does not match with the pattern."
                }
            }
        });
    ! function(t) {
        t && t.__esModule && t.default
    }(n);
    n.SkipValidation, n.validateSingle;
    var i = n.validate,
        r = n.required,
        o = (n.isNumber, n.isString, n.isFunction),
        a = n.isObject,
        u = (n.isArray, n.length, n.isEmail, n.equalsTo, n.minLength, n.maxLength, n.isBoolean, n.within, n.excludes, n.pattern, function() {
            function t(t, e) {
                for (var n = 0; n < e.length; n++) {
                    var i = e[n];
                    i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, i.key, i)
                }
            }
            return function(e, n, i) {
                return n && t(e.prototype, n), i && t(e, i), e
            }
        }()),
        l = function(t, e) {
            return Array.isArray(t) ? t.forEach(e) : Object.keys(t).map(function(n) {
                return e(t[n], n)
            })
        },
        s = function(t) {
            return t ? JSON.parse(JSON.stringify(t)) : t
        },
        d = {
            onSuccess: [r(!0), o()],
            onError: [r(!1), o()],
            onClose: [r(!1), o()]
        },
        c = {
            publicKey: r(!0),
            productUrl: r(!0),
            productIdentity: r(!0),
            productName: r(!0),
            eventHandler: r(!0),
            amount: r(!0),
            merchantData: [r(!1), a()]
        };
    return function() {
        function e(n) {
            t(this, e), this._widgetId = "khalti-widget-" + Date.now(), this._config = n, this._widget = this.attachWidget(), this.listenToWidget()
        }
        return u(e, [{
            key: "listenToWidget",
            value: function() {
                var t = this;
                window.addEventListener("message", function(e) {
                    if (e.data.realm)
                        if ("widgetInit" === e.data.realm) t.widgetInit(e.data.payload);
                        else {
                            if (!e.data.payload || e.data.payload.widget_id !== t._widgetId) return;
                            var n = "handle_msg_" + e.data.realm;
                            t[n](e.data.payload)
                        }
                }, !1)
            }
        }, {
            key: "msgWidget",
            value: function(t, e) {
                (e = s(e)).widgetId = this._widgetId, this._widget.contentWindow.postMessage({
                    realm: t,
                    payload: e
                }, "*")
            }
        }, {
            key: "handle_msg_widgetInit",
            value: function() {
                this.widgetInit()
            }
        }, {
            key: "widgetInit",
            value: function() {
                var t = s(this._config);
                delete t.eventHandler, this.msgWidget("paymentInfo", t)
            }
        }, {
            key: "validateConfig",
            value: function() {
                var t = i(this._config, c);
                if (t) throw new Error(JSON.stringify(t));
                var e = i(this._config.eventHandler, d);
                if (e) throw new Error(JSON.stringify({
                    eventHandler: e
                }))
            }
        }, {
            key: "handle_msg_walletPaymentVerification",
            value: function(t) {
                this._config.eventHandler.onSuccess(t), this.hide()
            }
        }, {
            key: "handle_msg_widgetError",
            value: function(t) {
                var e = this._config.eventHandler.onError;
                e && e(t)
            }
        }, {
            key: "disableParentScrollbar",
            value: function() {
                this.parentOverflowValue = window.document.body.style.overflowY, window.document.body.style.overflowY = "hidden"
            }
        }, {
            key: "enableParentScrollbar",
            value: function() {
                window.document.body.style.overflowY = this.parentOverflowValue, this.parentOverflowValue = null
            }
        }, {
            key: "show",
            value: function(t) {
                this._config.source = "web", this._widget.setAttribute("src", "http://192.168.10.4:4200/widget"), Object.assign(this._config, t), this.validateConfig(), this.disableParentScrollbar(), this._widget.style.display = "block", this.widgetInit()
            }
        }, {
            key: "handle_msg_hide",
            value: function() {
                this.hide();
                var t = this._config.eventHandler.onClose;
                t && t()
            }
        }, {
            key: "hide",
            value: function() {
                this.enableParentScrollbar(), this._widget.style.display = "none"
            }
        }, {
            key: "attachWidget",
            value: function() {
                var t = window.document.createElement("iframe");
                return t.setAttribute("id", this._widgetId), t.style.position = "fixed", t.style.display = "none", t.style.top = "0", t.style.left = "0", t.width = "100%", t.height = window.innerHeight + "px", t.style.zIndex = 999999999, t.setAttribute("frameborder", 0), t.setAttribute("allowtransparency", !0), window.document.body.appendChild(t), t
            }
        }, {
            key: "postAtURL",
            value: function(t) {
                var e = "khalti-ebanking-form-" + Date.now();
                this.ebankingForm && window.document.body.removeChild(this.ebankingForm);
                var n = window.document.createElement("form");
                n.setAttribute("id", e), n.setAttribute("action", t.url), n.setAttribute("target", "_blank"), n.setAttribute("method", "POST"), n.style.display = "none", l(t.paymentInfo, function(t, e) {
                    var i = window.document.createElement("input");
                    i.setAttribute("name", e), i.value = t, n.appendChild(i)
                }), window.document.body.appendChild(n), this.ebankingForm = n, n.submit()
            }
        }]), e
    }()
}();