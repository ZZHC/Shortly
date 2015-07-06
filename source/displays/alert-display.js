class AlertDisplay {
  displayShortlink(shortlink) {
    this.displayMessage(shortlink);
  }

  displayError(errorMsg) {
    this.displayMessage(errorMsg);
  }

  displayMessage(message, type='text') {
    window.alert(message);
  }
}

export default AlertDisplay
