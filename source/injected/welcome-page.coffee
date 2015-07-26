updatePageLocale = (localePackage) ->
  document.body.parentElement.lang = localePackage.langProp
  document.title = localePackage.title

  document.querySelector('h1').innerText = localePackage.title
  document.querySelector('.lead').innerText = localePackage.lead
  document.querySelector('.assurance span').innerText = localePackage.assurance
  document.querySelector('.close-button').innerText = localePackage.continue

  document.querySelector('#account-google .account-title').innerText = localePackage.google.title
  document.querySelector('#account-google .account-help').innerHTML = localePackage.google.helpText
  document.querySelector('#account-bitly .account-title').innerText = localePackage.bitly.title
  document.querySelector('#account-bitly .account-help').innerHTML = localePackage.bitly.helpText

  for button in document.querySelectorAll('.connect-button')
    button.innerText = localePackage.connect

respondToMessage = (event) ->
  switch event.name
    when 'localePackage'
      updatePageLocale(event.message)

safari.self.addEventListener('message', respondToMessage, false)
