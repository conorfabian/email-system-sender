angular.module('emailApp', [])
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
}])
.constant('API_CONFIG', {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000
});