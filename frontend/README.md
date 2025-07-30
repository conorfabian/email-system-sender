# Frontend Notes

AngularJS frontend with Bootstrap 5.1.3 for layout and Roboto typography to match ScriptChain's website. The index.html has a simple form with name/email inputs, submit button, and success/error message areas. Used ng-model for data binding, ng-show for visibility, and ng-class for validation styling.

The app.js file sets up the AngularJS module and configures JSON headers (otherwise AngularJS doesn't send the right content-type). API config is in constants with 10 second timeout to prevent hanging requests.

Most logic is in emailController.js - handles form data, loading states, and messages. The submitForm function validates input, shows loading spinner, sanitizes data, calls the API service, and handles responses with different error messages based on HTTP status codes (409 for duplicates, 400 for validation, 500 for server errors). Success clears the form and shows a message. Messages auto-hide after a few seconds and clear when user starts typing again.

The apiService.js handles backend communication with a generic makeRequest function that returns promises. The registerUser function validates inputs, sanitizes them, and posts to /register. Includes healthCheck for connectivity testing and handleError for mapping status codes to user-friendly messages.

For styling I matched ScriptChain's design - purple #673ab7 primary color, indigo #3f51b5 for hover, soft beige #faf6f2 background. Clean card design with subtle shadows and 4px border radius. Form fields are 56px high (Material Design standard) with 16px font to prevent iOS zoom. Responsive design works on mobile.

Data flow: user types → AngularJS updates scope → submit validates and calls API → service sends request → controller shows success/error message → message auto-hides. Error handling at multiple levels with client validation, server validation, HTTP errors, and user-friendly display. For testing just open index.html in browser and test all scenarios.