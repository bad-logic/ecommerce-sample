class customCheckout {
    constructor(config) {
        this._config = config;
    }
    show() {
        this.createFrame();
        this.close();
    }
    createFrame() {
        var ifrm = document.createElement('iframe');
        ifrm.setAttribute('id', 'ifrm');
        ifrm.setAttribute('frameborder', '0');
        ifrm.style.display = "block";
        ifrm.style.position = "fixed";
        ifrm.style.zIndex = 1;
        ifrm.style.width = "100%";
        ifrm.style.height = "100%";
        ifrm.style.left = "25%";
        ifrm.style.top = "5%";
        ifrm.style.align = "middle";
        var el = document.getElementById('payment-button');
        el.parentNode.insertBefore(ifrm, el);

        // window.localStorage.setItem('paymentConfig', JSON.stringify(this._config));
        // ifrm.contentWindow.postMessage(this._config, '*');
        const message = {...this._config };
        setTimeout(function() {
            ifrm.contentWindow.postMessage(JSON.stringify(message), '*');
        }, 1000);
        ifrm.setAttribute('src', 'http://192.168.10.3:4200');
    }
    close() {
        window.addEventListener('message', function(e) {
            var someIframe = window.parent.document.getElementById('ifrm');
            someIframe.parentNode.removeChild(someIframe);
        });
    }
}