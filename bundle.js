(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var nani = require('nani').init(auth.clientId, auth.clientSecret);
var genres = new Map(); //map with genres frequency
var staff = new Map(); //map with id and staff frequency
var completeStaff = new Map(); //map with id and staff info
var completeStudios = new Map();
var studio  = new Map();
$( "#target" ).click(function( event ) {
  var username = $("#username").val();
  retrieveUser(username);
  event.preventDefault();
});
function retrieveUser(username){
 if(!User.load())
 nani.get('user/'+username+'/animelist')
  .then(data => {
    console.log(data);
    ListsOfAnime(data).then(function(result){
    	User.init(username, data);
    	Stats.init({lists:result, genres:genres , staff:staff, studio:studio,
    	 staffNamesMap:completeStaff, studiosNamesMap: completeStudios });
    	console.log(result);
    	console.log(genres);
    	console.log(staff);
    	console.log(studio);
    });
  })
  .catch(error => {
    console.log(error);
  });
  else
  {
  	User.load();
  	Stats.load();
  	console.log("load everything");
  }
}
//create a genre and staff maps
function statsMaps (animeList)
{
}

 //TODO: need to extract name, pic, desc 
function  ListsOfAnime (userData){
 var deferred = $.Deferred();
 var animeLists = new Map();
 var promises = [];
 var lists = ["completed", "dropped", "on_hold", "watching"];
 for (var i = lists.length - 1; i >= 0; i--) {
 	var list = [].concat.apply([], userData.lists[lists[i]]);
 	var watchList = list.map(function(animeItem){
	 	return animeItem.anime.id;
	 });
	promises.push(checkForAnimeDetails(lists[i],watchList));
 }
 $.when.apply($, promises).then(function() {
    var temp=arguments; // The array of resolved objects as a pseudo-array
    deferred.resolve(arguments);
 });
 return deferred.promise();
}

function retrieveStaffAndGenres(id) {
	var deferred = $.Deferred();
	nani.get('anime/'+id+'/staff')
	  .then(data => {
	  	var staff = {};
	  	data.staff.forEach(function(staffMember){
	  		staff[staffMember.id]= {
	  			name_first: staffMember.name_first,
	  			name_last: staffMember.name_last,
	  			role: staffMember.role
	  		};
	  	});
	  	//console.log("staff ",staff);
	    deferred.resolve({genres: data.genres ,staff:  staff, action: "staff&genres", id: id});
	  })
	  .catch(error => {
	    console.log(error);
	  });
	 return deferred.promise();	
}

//studio is an array of studios
//made of 
//id
//main_studio
//studio_name
//studio_wiki
function retrieveStudio(id){
	var deferred = $.Deferred();
	nani.get('anime/'+id+"/page")
	  .then(data => {
	  	var staff = {};
	  	data.staff.forEach(function(staffMember){
	  		staff[staffMember.id]= {
	  			name_first: staffMember.name_first,
	  			name_last: staffMember.name_last,
	  			role: staffMember.role
	  		};
	  	});
	    deferred.resolve({genres: data.genres ,staff:  staff, studios: data.studio , action: "studio", id: id});
	  })
	  .catch(error => {
	    console.log(error);
	  });
	 return deferred.promise();
}

/**
 * checkForAnimeDetails Promise creates and sends all promses for that list of anime and formats it
 * @param  {string}  name      name of list
 * @param  {array}   animeIds  an array of anime Ids
 * @return {[type]}            [description]
 */
function checkForAnimeDetails (name,animeIds) {
  var deferred = $.Deferred();
  var promises=[];
  for (var i = 0; i < animeIds.length; i++) {
   // promises.push( retrieveStaffAndGenres(animeIds[i]) );
    promises.push( retrieveStudio(animeIds[i]));

  };
  $.when.apply($, promises).then(function() {
    var temp=arguments; // The array of resolved objects as a pseudo-array
    processInfo(name,temp).then(function(response){
    		deferred.resolve(response);
    });
  });
  return deferred.promise();
}
/**
 * processInfo Promise that fuses genres and staff to one item 
 * @param  {[type]} name [name of the list]
 * @param  {[type]} data [psudo array of resolved promosises]
 * @return {[object]}      [object with name and a map of animes id as key and anime object with genres and staff]
 *                         	
 */
 /*
 Current Anime Object
 object in map Anime item
 id: Number
 Genres: Array of Strings
 Staff: Object of key staff ids
 			with value as
 			name_first:
  			name_last: 
  			role: 
 Studios: Object of key studio ids
			id
			main_studio
			studio_name
			studio_wiki
  */
function processInfo(name,data){
	var deferred = $.Deferred();
	var animeList = new Map();
	var genresStats = new Map();
	var staffStats = new Map();
	var studioStats = new Map();
	for(var i = 0; i < data.length; i++)
	{
		var item = data[i];
		switch(item.action){
			case "studio":
			//find frequency for each genre
			item.studios.forEach(function(val)
			{
				if(val.main_studio)
				{
					dictAdd(studioStats,val.id);
					dictAdd(studio,val.id);					
				}
				dictSave(completeStudios,val.id,val);
			});
			if(!animeList.has(item.id))
			{
				var anime = {id: item.id, studios: item.studios };
				animeList.set(item.id, anime);
			}
			else
			{
				var anime = animeList.get(item.id);
				anime.studios = item.studios;
				animeList.set(item.id, anime);
			}
			//break;
			//case "staff&genres":
				//find frequency for each genre
				item.genres.forEach(function(val)
				{
					dictAdd(genresStats,val);
					dictAdd(genres,val);
				});
				//find frequenc for each staff
				Object.keys(item.staff).forEach(function(val)
				{
					dictAdd(staffStats, val);
					dictAdd(staff, val);
					dictSave(completeStaff,val,item.staff[val]);

				});
				//add anime staff data to anime
				if(!animeList.has(item.id))
				{
					var anime = {id: item.id, staff: item.staff, genres: item.genres};
					animeList.set(item.id, anime);
				}
				else
				{
					var anime = animeList.get(item.id);
					anime.staff = item.staff;
					anime.genres = item.genres;
					animeList.set(item.id, anime);
				}
			break;
		}
	}
	deferred.resolve({name: name,map: animeList, 
		stats: {genre: genresStats, staff: staffStats, studios: studioStats}});
	return deferred.promise();
}

/**
 * dictAdd adds one to value if found or adds it to map
 * @param  {map} dictionary [a js map]
 * @param  {[type]} val        [a value]
 * @return {[type]}            [description]
 */
function dictAdd(dictionary, val)
{
	if(dictionary.has(val))
	{
		var num = dictionary.get(val);
		num++;
		dictionary.set(val, num);
	}
	else
	{
		dictionary.set(val,1);
	}
}
/**
 * dictSave save key in dictionary if it doesnt exist yet
 * @param  {[map]} dictionary [map of staff info]
 * @param  {[type]} key        [key id]
 * @param  {[object]} value      [information about the staff]
 */
function dictSave(dictionary, key, value)
{
	if(!dictionary.has(key))
	{
		dictionary.set(key,value);
	}

}
},{"nani":2}],2:[function(require,module,exports){
'use strict';

const authenticate = require('./lib/authenticate');
const request = require('./lib/request');

let nani = {
  init: function (id, secret) {
    this.id = id;
    this.secret = secret;

    return this;
  },
  id: '',
  secret: '',
  authInfo: {
    token: '',
    expires: ''
  }
};

nani.authenticate = function () {
  let id = this.id;
  let secret = this.secret;

  return authenticate(id, secret)
    .then(data => {
      this.authInfo.token = data.token;
      this.authInfo.expires = data.expires;
    });
};

nani.get = function (query) {
  return request(this.authInfo, query)
    .catch(error => {
      if (error.message !== 'Token does not exist or has expired') {
        throw error;
      } else {
        return this.authenticate()
          .then(() => this.get(query));
      }
    });
};

module.exports = nani;

},{"./lib/authenticate":3,"./lib/request":4}],3:[function(require,module,exports){
'use strict';

const url = require('./utils').url;
const fetch = require('isomorphic-fetch');

let authenticate = function (id, secret) {
  if (!id || !secret) {
    return Promise.reject(new Error('No client ID or secret given'));
  }

  let formData = {
    grant_type: 'client_credentials',
    client_id: id,
    client_secret: secret
  };

  return fetch(`${url}auth/access_token`, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(formData)
  })
    .then(result => result.json())
    .then(result => {
      return {
        token: result.access_token,
        expires: result.expires
      };
    });
};

module.exports = authenticate;

},{"./utils":5,"isomorphic-fetch":6}],4:[function(require,module,exports){
'use strict';

const url = require('./utils').url;
const hasParam = require('./utils').hasParam;
const isExpired = require('./utils').isExpired;
const fetch = require('isomorphic-fetch');

let request = function (authInfo, query) {
  let token = authInfo.token;
  let expires = authInfo.expires;

  if (!token || isExpired(expires)) {
    return Promise.reject(new Error('Token does not exist or has expired'));
  }

  let fullQuery = `${url + query}`;
  fullQuery = hasParam(fullQuery)
    ? `${fullQuery}&access_token=${token}`
    : `${fullQuery}?access_token=${token}`;

  return fetch(fullQuery)
    .then(response => {
      if (response.status === 404 || response.status === 500) {
        throw new Error('Bad query');
      }

      if (response.status === 401) {
        throw new Error('Token does not exist or has expired');
      }

      return response.json();
    });
};

module.exports = request;

},{"./utils":5,"isomorphic-fetch":6}],5:[function(require,module,exports){
'use strict';

const url = 'https://anilist.co/api/';
const now = () => Math.floor(Date.now() / 1000);
const isExpired = expirationTime => expirationTime <= now() + 300;
const hasParam = string => string.indexOf('?') !== -1;

module.exports = {
  url,
  isExpired,
  hasParam
};

},{}],6:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":7}],7:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}]},{},[1]);
