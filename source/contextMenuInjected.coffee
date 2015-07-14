contextMenuHandler = (event) ->
  nodeName = event.target.nodeName
  linkCandidates = {}

  switch nodeName
    when 'IMG' then linkCandidates['image'] = event.target.src
    when 'A'   then linkCandidates['link'] = event.target.href

  do _findHyperlinkParent = ->
    return if nodeName is 'A'
    targetNode = event.target.parentNode

    while targetNode and targetNode.nodeType isnt Node.DOCUMENT_NODE
      if targetNode.nodeName is 'A' and not targetNode.href.match(/^\#/)
        linkCandidates['link'] = targetNode.href
        break
      else
        targetNode = targetNode.parentNode

  safari.self.tab.setContextMenuEventUserInfo(event, linkCandidates)

# Register handler
document.addEventListener('contextmenu', contextMenuHandler)
