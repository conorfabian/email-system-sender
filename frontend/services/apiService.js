angular.module('emailApp')
.service('ApiService', ['$http', '$q', 'API_CONFIG', function($http, $q, API_CONFIG) {
    
    var self = this;
    
    // Configure HTTP defaults
    $http.defaults.timeout = API_CONFIG.TIMEOUT;
    
    // Helper function to handle HTTP requests
    self.makeRequest = function(method, url, data) {
        var deferred = $q.defer();
        
        var config = {
            method: method,
            url: API_CONFIG.BASE_URL + url,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        $http(config)
            .then(function(response) {
                // Success callback
                deferred.resolve(response);
            })
            .catch(function(error) {
                // Error callback
                console.error('API Error:', error);
                deferred.reject(error);
            });
        
        return deferred.promise;
    };
    
    // Register user endpoint
    self.registerUser = function(userData) {
        // Validate input data
        if (!userData || !userData.name || !userData.email) {
            return $q.reject({
                status: 400,
                data: {
                    message: 'Name and email are required'
                }
            });
        }
        
        // Sanitize input data
        var sanitizedData = {
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase()
        };
        
        // Basic email validation
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedData.email)) {
            return $q.reject({
                status: 400,
                data: {
                    message: 'Please enter a valid email address'
                }
            });
        }
        
        // Make the API request
        return self.makeRequest('POST', '/register', sanitizedData);
    };
    
    // Health check endpoint (for testing connectivity)
    self.healthCheck = function() {
        return self.makeRequest('GET', '/health');
    };
    
    // Test connection method
    self.testConnection = function() {
        var deferred = $q.defer();
        
        self.healthCheck()
            .then(function(response) {
                deferred.resolve({
                    connected: true,
                    message: 'Successfully connected to backend',
                    data: response.data
                });
            })
            .catch(function(error) {
                deferred.resolve({
                    connected: false,
                    message: 'Unable to connect to backend server',
                    error: error
                });
            });
        
        return deferred.promise;
    };
    
    // Generic error handler
    self.handleError = function(error) {
        var errorInfo = {
            status: error.status || 0,
            message: 'An unexpected error occurred'
        };
        
        if (error.data && error.data.message) {
            errorInfo.message = error.data.message;
        } else if (error.status === 0 || error.status === -1) {
            errorInfo.message = 'Unable to connect to server. Please check your internet connection.';
        } else if (error.status === 400) {
            errorInfo.message = 'Invalid request data. Please check your input.';
        } else if (error.status === 404) {
            errorInfo.message = 'The requested resource was not found.';
        } else if (error.status === 409) {
            errorInfo.message = 'This email address is already registered.';
        } else if (error.status === 500) {
            errorInfo.message = 'Server error occurred. Please try again later.';
        } else if (error.status === 503) {
            errorInfo.message = 'Service temporarily unavailable. Please try again later.';
        }
        
        return errorInfo;
    };
    
}]);