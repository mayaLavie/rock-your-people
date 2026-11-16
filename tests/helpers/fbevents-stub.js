/*
 * Local stand-in for https://connect.facebook.net/en_US/fbevents.js (test only).
 * Mimics the observable behaviour of the real pixel: drains the snippet's queue,
 * and turns fbq('track', name, params, {eventID}) into an image GET to
 * https://www.facebook.com/tr/?id=<pixel>&ev=<name>&eid=<eventID>&cd[k]=v ...
 * The Playwright helper (meta-network.ts) fulfils that request locally.
 */
(function () {
  var old = window.fbq;
  var queued = (old && old.queue) || [];
  var pixels = [];
  var consent = "grant";

  function send(ev, params, opts, custom) {
    if (consent === "revoke") return;
    pixels.forEach(function (id) {
      var q = ["id=" + encodeURIComponent(id), "ev=" + encodeURIComponent(ev)];
      q.push("dl=" + encodeURIComponent(location.href));
      q.push("ts=" + Date.now());
      if (opts && opts.eventID) q.push("eid=" + encodeURIComponent(opts.eventID));
      if (custom) q.push("cd[__custom]=1");
      Object.keys(params || {}).forEach(function (k) {
        var v = params[k];
        if (v !== null && typeof v === "object") v = JSON.stringify(v);
        q.push("cd[" + encodeURIComponent(k) + "]=" + encodeURIComponent(v));
      });
      new Image().src = "https://www.facebook.com/tr/?" + q.join("&");
    });
  }

  function handle(args) {
    args = Array.prototype.slice.call(args);
    var cmd = args[0];
    if (cmd === "init") {
      if (pixels.indexOf(String(args[1])) === -1) pixels.push(String(args[1]));
    } else if (cmd === "track") {
      send(args[1], args[2], args[3], false);
    } else if (cmd === "trackCustom") {
      send(args[1], args[2], args[3], true);
    } else if (cmd === "consent") {
      consent = args[1];
    }
    // 'set', 'on', etc. are accepted and ignored.
  }

  var fbq = function () {
    handle(arguments);
  };
  fbq.push = function (a) {
    handle(a);
  };
  fbq.loaded = true;
  fbq.version = "2.9.stub";
  fbq.queue = [];
  fbq.callMethod = undefined;
  window.fbq = window._fbq = fbq;
  queued.forEach(function (a) {
    handle(a);
  });
})();
