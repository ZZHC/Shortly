class AlertDisplay {
  displayShortlink(result) {
    this.displayMessage(`${result.shortlink}\n\n${result.title}`);
  }

  displayError(errorMsg) {
    this.displayMessage(errorMsg);
  }

  displayMessage(message, type='text') {
    window.alert(message);
  }
}

export default AlertDisplay
