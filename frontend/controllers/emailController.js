angular.module('emailApp')
.controller('EmailController', ['$scope', 'ApiService', function($scope, ApiService) {
    
    // Initialize scope variables
    $scope.formData = {
        name: '',
        email: ''
    };
    
    $scope.isLoading = false;
    $scope.submitted = false;
    $scope.showSuccess = false;
    $scope.showError = false;
    $scope.successMessage = '';
    $scope.errorMessage = '';
    
    // Email validation function
    $scope.isValidEmail = function(email) {
        if (!email) return false;
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    // Reset messages
    $scope.resetMessages = function() {
        $scope.showSuccess = false;
        $scope.showError = false;
        $scope.successMessage = '';
        $scope.errorMessage = '';
    };
    
    // Show success message
    $scope.showSuccessMessage = function(message) {
        $scope.resetMessages();
        $scope.successMessage = message;
        $scope.showSuccess = true;
        
        // Auto-hide success message after 10 seconds
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.showSuccess = false;
            });
        }, 10000);
    };
    
    // Show error message
    $scope.showErrorMessage = function(message) {
        $scope.resetMessages();
        $scope.errorMessage = message;
        $scope.showError = true;
        
        // Auto-hide error message after 8 seconds
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.showError = false;
            });
        }, 8000);
    };
    
    // Client-side validation
    $scope.validateForm = function() {
        var isValid = true;
        var errors = [];
        
        // Check if name is provided
        if (!$scope.formData.name || $scope.formData.name.trim() === '') {
            errors.push('Name is required');
            isValid = false;
        }
        
        // Check if email is provided and valid
        if (!$scope.formData.email || $scope.formData.email.trim() === '') {
            errors.push('Email is required');
            isValid = false;
        } else if (!$scope.isValidEmail($scope.formData.email)) {
            errors.push('Please enter a valid email address');
            isValid = false;
        }
        
        return {
            isValid: isValid,
            errors: errors
        };
    };
    
    // Form submission handler
    $scope.submitForm = function() {
        $scope.submitted = true;
        $scope.resetMessages();
        
        // Client-side validation
        var validation = $scope.validateForm();
        if (!validation.isValid) {
            $scope.showErrorMessage('Please fix the form errors: ' + validation.errors.join(', '));
            return;
        }
        
        // Set loading state
        $scope.isLoading = true;
        
        // Prepare data for submission
        var submitData = {
            name: $scope.formData.name.trim(),
            email: $scope.formData.email.trim().toLowerCase()
        };
        
        // Call API service
        ApiService.registerUser(submitData)
            .then(function(response) {
                // Success handling
                $scope.isLoading = false;
                $scope.submitted = false;
                
                // Reset form
                $scope.formData = {
                    name: '',
                    email: ''
                };
                
                // Show success message
                var successMsg = response.data.message || 'Registration successful! Please check your email for confirmation.';
                $scope.showSuccessMessage(successMsg);
                
            })
            .catch(function(error) {
                // Error handling
                $scope.isLoading = false;
                
                var errorMsg = 'An unexpected error occurred. Please try again.';
                
                // Handle different types of errors
                if (error.data && error.data.message) {
                    errorMsg = error.data.message;
                } else if (error.status === 409) {
                    errorMsg = 'This email address is already registered. Please use a different email.';
                } else if (error.status === 400) {
                    errorMsg = 'Please check your input data and try again.';
                } else if (error.status === 500) {
                    errorMsg = 'Server error occurred. Please try again later.';
                } else if (error.status === 0 || error.status === -1) {
                    errorMsg = 'Unable to connect to server. Please check your internet connection.';
                }
                
                $scope.showErrorMessage(errorMsg);
            });
    };
    
    // Watch for form changes to hide messages
    $scope.$watch('formData', function(newVal, oldVal) {
        if (newVal !== oldVal && $scope.submitted) {
            // Reset validation state when user starts typing
            if (newVal.name !== oldVal.name || newVal.email !== oldVal.email) {
                $scope.resetMessages();
            }
        }
    }, true);
    
}]);