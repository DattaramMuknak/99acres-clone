"use strict";

function Buffer() {
    this._container = [], this._subscriptions = [], Object.defineProperties(this, {
        size: {
            get: function() {
                return this._container.length
            }
        }
    })
}

function initBatching(t) {
    function e() {
        return setInterval(executeBatch.bind(this, a), i)
    }
    self.removeEventListener("message", initBatching);
    var n = t.data,
        r = n.batchSize,
        i = n.batchTimeout,
        a = new Buffer,
        o = null;
    a.subscribe((function c(t) {
        t.size == r && (executeBatch(t), clearInterval(o), e())
    })), self.addEventListener("message", a.push.bind(a)), self.addEventListener("message", (function s(t) {
        t.data && t.data.event && "beforeunload" == t.data.event && a._container.length > 0 && a._container.length < 5 && (executeBatch(a), clearInterval(o), e())
    })), o = e()
}

function executeBatch(t) {
    if (t.size) {
        var e, n = [],
            r = !0,
            i = !1,
            a = void 0;
        try {
            for (var o, c = t[Symbol.iterator](); !(r = (o = c.next()).done); r = !0) {
                var s = o.value;
                n.push(JSON.stringify(s.data))
            }
        } catch (t) {
            i = !0, a = t
        } finally {
            try {
                r || null == c.return || c.return()
            } finally {
                if (i) throw a
            }
        }
        return e = "trackingData[]=[" + encodeURIComponent(n.join(",")) + "]", t.flush(), fetch_retry("/do/clickStreamTracking/ClickStream/trackData", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: e
        }, 3).catch(console.error)
    }
}

function fetch_retry(t, e, n) {
    return fetch(t, e).catch((function(r) {
        if (1 === n) throw r;
        return fetch_retry(t, e, n - 1)
    }))
}
Buffer.prototype.subscribe = function(t) {
    var e = this,
        n = this._subscriptions.push(t);
    return function() {
        e._subscriptions = e._subscriptions.filter((function(t, e) {
            return e != n
        }))
    }
}, Buffer.prototype.emit = function() {
    var t = this;
    this._subscriptions.forEach((function(e) {
        e(t)
    }))
}, Buffer.prototype.push = function(t) {
    return t && t.data && t.data.event && "beforeunload" == t.data.event || this._container.push(t), this.emit(), this
}, Buffer.prototype.flush = function() {
    return this._container = [], this
}, Buffer.prototype.getStash = function() {
    return this._container.slice()
}, Buffer.prototype[Symbol.iterator] = function() {
    var t = 0,
        e = this._container.slice();
    return {
        next: function n() {
            return {
                value: e[t++],
                done: !(t - 1 in e)
            }
        }
    }
}, self.addEventListener("message", initBatching);