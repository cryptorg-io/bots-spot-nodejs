const cryptorgApi = require('./CryptorgApi');

var api = new cryptorgApi('API_KEY', 'API_SECRET');

api.botList().then(response = function(data) {
	console.log(JSON.parse(data));
})