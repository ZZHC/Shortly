const URL_PATTERN = /http(s)?:\/\/(gist\.)?github\.com/;

export default class GithubShortener {
  getShortlink(longUrl) {
    return fetch('https://git.io', {
      method: 'post',
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      body: 'url=' + encodeURIComponent(longUrl)
    })
      .then( response => {
        if (response.ok) {
          return response.headers.get('Location');
        } else {
          return response.text()
            .then( errorMsg => Promise.reject('Error: ' + errorMsg) )
        }
      })
  }

}
