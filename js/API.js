const API = (()=> {
  let domain = 'https://facebookoptimizedlivestreamsellingsystem.rayawesomespace.space'

  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }

  function GET (URI) { //  /api/items
    let userToken = Cookies.get('buy-user-token')
    headers['Authorization'] = `Bearer ${ userToken }`

    let config = {
      'url': `${domain}${URI}`,
      'method': 'GET',
      headers
    }
    return $.ajax(config)
  }

  return {
    GET // GET: GET
  }
})()