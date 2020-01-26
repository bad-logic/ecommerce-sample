const deleteProduct = (btn) => {

    // this is passed, which represents the context button
    const id = btn.parentNode.querySelector('[name=id]').value;
    const _csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const prodElement = btn.closest('article');


    // if no url specified it will send to the current host
    // fetch is used for both fetching and sending data
    fetch(`/admin/product/${id}`, {
            method: 'DELETE',
            headers: {
                // csurf package will look for csrf token in headers, body and query params
                // to learn more about the keys(eg: _csrf, csrf-token, etc ) it will look see official docs of scurf package
                'csrf-token': _csrf
            }
        }).then(done => {
            if (done.status == 200) {
                // prodElement.remove();// not supported in internet explorer
                prodElement.parentNode.removeChild(prodElement); // supported in all browsers
            }
        })
        .catch(err => {
            console.log('err>>', err);
        });

}