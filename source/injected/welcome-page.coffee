updatePageLocale = (localePackage) ->
  document.body.lang = localePackage.langProp
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
    button.dataset.connected = localePackage.connected

  document.querySelector('.container').classList.add('ready')

respondToMessage = (event) ->
  switch event.name
    when 'localePackage'
      updatePageLocale(event.message)
    when 'authSuccess'
      sectionNode = document.querySelector("#account-#{event.message}")
      button = sectionNode.querySelector('.connect-button')

      sectionNode.classList.add('connected')
      sectionNode.querySelector('.account-icon').innerHTML = '&#x2713;'
      button.innerText = button.dataset.connected

onButtonClick = (event) ->
  return true unless (action = event.target.dataset.action)

  safari.self.tab.dispatchMessage("runAction", action)
  event.preventDefault()

# Init event listeners
safari.self.addEventListener('message', respondToMessage, false)
document.addEventListener('click', onButtonClick, false)
