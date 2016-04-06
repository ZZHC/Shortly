KKBOX_PATTERN = /^https?\:\/\/\w*\.?kkbox.com\/.*(album|song)\//

responseToRequest = (request) ->
  switch request.name
    when 'findShortlink'
      shortlink = findShortlink()
      safari.self.tab.dispatchMessage('shortlinkFromPage', shortlink);

findShortlink = (document = window.document) ->
  relLinks = document.querySelectorAll('link[rel=shortlink], link[rel=shorturl]')

  return switch
    when relLinks.length
      relLinks[0].href
    when KKBOX_PATTERN.test(location.href)
      parseKKBOXShortlink(document)
    else
      false

parseKKBOXShortlink = (document = window.document) ->
  innerHTML = document.body?.innerHTML || ''

  if match = innerHTML.match(/https?:\/\/kkbox.fm\/\w+/)
    return match[0]

if module?
  module.exports = findShortlink
else
  do ->
    return false unless window.top is window.self
    safari.self.addEventListener('message', responseToRequest, false)
