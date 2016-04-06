const TIMEOUT_MS = 5000;

export default class InjectedPageShortener {
  getShortlink(options={page: null}) {
    if ( !(options.page && options.page instanceof SafariWebPageProxy) ) {
      return Promise.reject("'options.page' parameter must be an instance of SafariWebPageProxy.")
    }

    return new Promise( (resolve, reject) => {
      var messageListener = new Function,
          unmount = new Function,
          timeoutID;

      messageListener = (msgEvent={name: null, message: null}) => {
        if (msgEvent.name === 'shortlinkFromPage') {
          if (msgEvent.message) {
            resolve(msgEvent.message);
          } else {
            reject('Not found from injected script.')
          }

          unmount();
        }
      };
      unmount = () => {
        // Work is done. Unmount listener and stop timeout.
        safari.application.removeEventListener('message', messageListener);
        window.clearTimeout(timeoutID);
      }

      timeoutID = setTimeout(() => {
        reject('Injected script timed out.');
        unmount();
      }, TIMEOUT_MS);

      options.page.dispatchMessage('findShortlink');
      safari.application.addEventListener('message', messageListener, false);
    });
  }
}
