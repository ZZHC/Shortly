KKBOX_PATTERN = /^https?\:\/\/\w*\.?kkbox.com\/.*(album|song)\//

responseToRequest = (request) ->
  return unless window.top is window

  switch request.name
    when 'findShortlink'
      shortlink = findShortlink()
      safari.self.tab.dispatchMessage('shortlinkFromPage', shortlink);

findShortlink = ->
  relLinks = document.querySelectorAll('link[rel=shortlink], link[rel=shorturl]')

  return switch
    when relLinks.length
      relLinks[0].href
    when KKBOX_PATTERN.test(location.href)
      parseKKBOXShortlink()
    else
      false

parseKKBOXShortlink = ->
  innerHTML = document.body?.innerHTML || ''

  if match = innerHTML.match(/https?:\/\/kkbox.fm\/\w+/)
    return match[0]

safari.self.addEventListener('message', responseToRequest, false)
